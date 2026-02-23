import json
import random

def generate_data():
    data = {
        "metadata": {
            "subject_id": "SUB-2024-001",
            "age_months": 36,
            "session_duration_seconds": 10,
            "frame_rate": 10
        },
        "timeline": [],
        "summary_stats": {}
    }

    # Simulation parameters
    total_frames = 100
    
    # 85% Stimulus/Void (Low Joint Attention), 15% Caregiver
    gaze_options = ["Stimulus", "Void", "Caregiver"]
    gaze_weights = [0.45, 0.40, 0.15] 

    caregiver_gaze_count = 0

    for i in range(total_frames):
        timestamp = round(i * 0.1, 1)
        
        # Gaze Generation
        gaze = random.choices(gaze_options, weights=gaze_weights, k=1)[0]
        if gaze == "Caregiver":
            caregiver_gaze_count += 1
            
        # Hand Flapping (Frames 40-70)
        hand_flapping = 40 <= i <= 70
        
        # Body Orientation (Facing away: 90-270 degrees)
        # 0 is facing caregiver. 180 is back to caregiver.
        # Simulating mostly facing away
        body_angle = random.randint(100, 260)

        frame = {
            "frame_id": i,
            "timestamp": timestamp,
            "gaze_target": gaze,
            "hand_flapping_detected": hand_flapping,
            "body_orientation_angle": body_angle
        }
        data["timeline"].append(frame)

    # Summary Stats
    joint_attention_ratio = caregiver_gaze_count / total_frames
    
    # Mock Risk Score Calculation
    # Low joint attention (< 0.2) increases risk
    # Hand flapping increases risk
    risk_score = 0
    if joint_attention_ratio < 0.2:
        risk_score += 40
    if joint_attention_ratio < 0.1:
        risk_score += 20
    
    # Check for sustained hand flapping
    if any(f["hand_flapping_detected"] for f in data["timeline"]):
        risk_score += 30
        
    # Baseline noise
    risk_score += random.randint(0, 10)
    
    data["summary_stats"] = {
        "joint_attention_ratio": joint_attention_ratio,
        "risk_score": min(risk_score, 100)
    }

    return data

if __name__ == "__main__":
    dataset = generate_data()
    with open("synthetic_screening_data.json", "w") as f:
        json.dump(dataset, f, indent=2)
    print("Dataset generated: synthetic_screening_data.json")
