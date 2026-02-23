import cv2
import mediapipe as mp
import numpy as np
import json
import sys
import os
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
from sklearn.ensemble import RandomForestClassifier
import shap
import joblib

# Initialize MediaPipe Solutions
try:
    if hasattr(mp, 'solutions'):
        mp_face_mesh = mp.solutions.face_mesh
        mp_pose = mp.solutions.pose
        mp_drawing = mp.solutions.drawing_utils
        mediapipe_available = True
    else:
        raise ImportError("mediapipe.solutions not found")
except Exception as e:
    mediapipe_available = False
    print(f"Warning: MediaPipe could not be loaded: {e}", file=sys.stderr)

# Initialize MobileNet (v2) for behavioral feature extraction
try:
    # Using MobileNetV2 pretrained on ImageNet as a feature extractor
    mobilenet = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
    mobilenet.eval()
    
    # Preprocessing for MobileNet
    preprocess = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    model_loaded = True
except Exception as e:
    model_loaded = False
    print(f"Warning: MobileNet could not be loaded: {e}", file=sys.stderr)

# Dummy Risk Classifier (Simulating a trained model)
# In a real scenario, this would be loaded from a file (e.g., joblib.load('risk_model.pkl'))
# We train a tiny one here for demonstration purposes/fallback
try:
    X_dummy = np.array([
        [0.1, 0.1, 0.05], # Low risk
        [0.8, 0.7, 0.1],  # High risk
        [0.2, 0.2, 0.1],  # Low risk
        [0.9, 0.1, 0.05], # Mod risk (high gaze, low movement variance)
    ])
    y_dummy = np.array([0, 1, 0, 1]) # 0: Low, 1: High
    risk_classifier = RandomForestClassifier(n_estimators=10, random_state=42)
    risk_classifier.fit(X_dummy, y_dummy)
    
    # Initialize SHAP explainer
    # Using a small background dataset for KernelExplainer as TreeExplainer is preferred for RF but let's keep it generic if needed
    # For RF, TreeExplainer is much faster
    explainer = shap.TreeExplainer(risk_classifier)
    classifier_loaded = True
except Exception as e:
    classifier_loaded = False
    print(f"Warning: Classifier/SHAP could not be initialized: {e}", file=sys.stderr)

def analyze_video(video_path):
    if not os.path.exists(video_path):
        return json.dumps({"error": "Video file not found"})

    cap = cv2.VideoCapture(video_path)
    
    # Metrics storage
    gaze_deviations = []
    social_engagement_frames = 0
    repetitive_movements_detected = 0
    
    total_frames = 0
    
    # MobileNet Features (for behavioral variance)
    behavioral_features = []

    # Context managers for MediaPipe
    face_mesh = None
    pose = None
    
    try:
        if mediapipe_available:
            face_mesh = mp_face_mesh.FaceMesh(min_detection_confidence=0.5, min_tracking_confidence=0.5)
            pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
        
        frame_skip = 5 # Analyze every 5th frame for performance
        
        while cap.isOpened():
            success, image = cap.read()
            if not success:
                break
            
            total_frames += 1
            if total_frames % frame_skip != 0:
                continue

            # Convert the BGR image to RGB.
            image.flags.writeable = False
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # --- MediaPipe Analysis ---
            if mediapipe_available:
                try:
                    # Face Mesh for Gaze
                    results_face = face_mesh.process(image_rgb)
                    if results_face.multi_face_landmarks:
                        for face_landmarks in results_face.multi_face_landmarks:
                            # Simple heuristic: looking at camera approx (nose tip x around 0.5)
                            nose_tip = face_landmarks.landmark[1]
                            if abs(nose_tip.x - 0.5) < 0.15 and abs(nose_tip.y - 0.5) < 0.2: 
                                social_engagement_frames += 1
                                gaze_deviations.append(0)
                            else:
                                gaze_deviations.append(1)
                    
                    # Pose for Repetitive Movements (Simplified: checking for high frequency arm movement would require temporal analysis)
                    # Here we just log if hands are raised high often (flapping proxy)
                    results_pose = pose.process(image_rgb)
                    if results_pose.pose_landmarks:
                        landmarks = results_pose.pose_landmarks.landmark
                        # Wrist y < Nose y (hands up)
                        l_wrist = landmarks[mp_pose.PoseLandmark.LEFT_WRIST]
                        r_wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST]
                        nose = landmarks[mp_pose.PoseLandmark.NOSE]
                        
                        if l_wrist.y < nose.y or r_wrist.y < nose.y:
                             repetitive_movements_detected += 1

                except Exception:
                    pass # Skip frame on MP error

            # --- MobileNet Analysis (Behavioral Features) ---
            if model_loaded:
                try:
                    # Convert CV2 image to PIL
                    pil_image = Image.fromarray(image_rgb)
                    input_tensor = preprocess(pil_image)
                    input_batch = input_tensor.unsqueeze(0)

                    with torch.no_grad():
                        output = mobilenet(input_batch)
                    
                    # Store max prob as a proxy for "clarity of action/object"
                    probabilities = torch.nn.functional.softmax(output[0], dim=0)
                    top_prob, _ = torch.topk(probabilities, 1)
                    behavioral_features.append(top_prob.item())
                except Exception:
                    pass

    finally:
        if mediapipe_available:
            if face_mesh: face_mesh.close()
            if pose: pose.close()
    
    cap.release()
    
    processed_count = total_frames / frame_skip if total_frames > 0 else 1

    # --- Feature Aggregation ---
    
    # 1. Avg Gaze Deviation (0 = perfect contact, 1 = no contact)
    avg_gaze_deviation = np.mean(gaze_deviations) if gaze_deviations else 0.5
    
    # 2. Social Engagement Score (Normalized frames looking at camera)
    social_score = (social_engagement_frames / processed_count) if processed_count > 0 else 0.5
    
    # 3. Behavioral Variance (from CNN) - Low variance might imply repetitive scenes
    behavior_variance = np.var(behavioral_features) if behavioral_features else 0.01

    # Prepare features for Classifier [GazeDeviation, 1-SocialScore, 1-Variance]
    # We invert social and variance to make "Higher = More Risky" for consistent input logic if needed
    features = np.array([[avg_gaze_deviation, 1.0 - social_score, 1.0 - min(behavior_variance * 10, 1.0)]])
    
    # --- Risk Prediction & SHAP ---
    risk_score = 0.0
    shap_values_dict = {}
    
    if classifier_loaded:
        try:
            # Predict Prob of Class 1 (High Risk)
            risk_probs = risk_classifier.predict_proba(features)
            risk_score = risk_probs[0][1] 
            
            # Predict Class
            prediction = risk_classifier.predict(features)[0]
            
            # SHAP Explanation
            shap_output = explainer(features)
            # shap_values[0] is for the first sample
            # .values gives the values for each feature
            # If binary classification, it might be (features, classes) or just (features,) depending on version
            vals = shap_output.values[0] 
            if len(vals.shape) > 1: # if multi-class output
                vals = vals[:, 1] # take positive class
                
            feature_names = ["Gaze Aversion", "Low Social Engagement", "Repetitive/Low Variety"]
            
            # Map values to names for frontend display
            # We take the absolute impact or just the raw value? 
            # Positive SHAP pushes towards risk (Class 1)
            for i, name in enumerate(feature_names):
                shap_values_dict[name] = round(float(vals[i]), 4)
                
        except Exception as e:
            print(f"Error in ML prediction: {e}", file=sys.stderr)
            # Fallback heuristic
            risk_score = (avg_gaze_deviation * 0.6) + ((1.0 - social_score) * 0.4)

    else:
        # Fallback Heuristic
        risk_score = (avg_gaze_deviation * 0.6) + ((1.0 - social_score) * 0.4)

    risk_score = min(max(risk_score, 0.05), 0.98) 
    early_risk_flag = risk_score > 0.6
    
    # --- Behavior Class & Evidence Scoring ---
    if risk_score > 0.7:
        behavior_class = "High Likelihood of ASD Traits"
    elif risk_score > 0.4:
        behavior_class = "Moderate Behavioral Concerns"
    else:
        behavior_class = "Typical Behavioral Patterns"
        
    # Explainable Report Text
    explanation_text = "Analysis based on " + ("ML model prediction." if classifier_loaded else "heuristic scoring.")
    top_factors = sorted(shap_values_dict.items(), key=lambda x: x[1], reverse=True)
    if top_factors:
        highest_factor = top_factors[0]
        if highest_factor[1] > 0:
             explanation_text += f" Primary risk factor detected: {highest_factor[0]} (SHAP impact: {highest_factor[1]})."
        else:
             explanation_text += " No significant risk factors identified by the model."

    # Result Object
    result = {
        "riskScore": round(risk_score, 2),
        "earlyRiskFlag": bool(early_risk_flag),
        "behaviorClass": behavior_class,
        "explanation": explanation_text,
        "detailedAnalysis": {
            "eyeGaze": f"Average gaze deviation detected at {round(avg_gaze_deviation * 100, 1)}%. Monitor for consistent eye contact.",
            "motorSkills": f"Behavioral variance index: {round(behavior_variance, 4)}. " + ("Repetitive movements flagged." if repetitive_movements_detected > 2 else "No significant repetitive motor patterns."),
            "social": f"Social engagement detected in {round(social_score * 100, 1)}% of analyzed frames.",
            "summary": f"Video analyzed {total_frames} frames. Risk assessment: {behavior_class}."
        },
        "shapValues": shap_values_dict,
        "diagnosticScores": {
             "socialCommunication": round((1.0 - social_score) * 10, 1), # 0-10 scale
             "restrictedRepetitive": round((1.0 - min(behavior_variance * 20, 1.0)) * 10, 1) # 0-10 scale
        }
    }
    
    return json.dumps(result)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No video path provided"}))
        sys.exit(1)
        
    video_path = sys.argv[1]
    try:
        output = analyze_video(video_path)
        print(output)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
