const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Screening } = require('../models');
// Import the Gemini service - try/catch in case the file doesn't exist yet during development
let analyzeVideo;
try {
    const geminiService = require('../services/gemini');
    analyzeVideo = geminiService.analyzeVideo;
} catch (e) {
    console.warn("Gemini service not found or failed to load:", e);
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Text-based mock analysis (Fallback)
const analyzeTextMock = async (text) => {
    const keywords = ['avoids', 'no eye contact', 'repetitive', 'flapping', 'delayed'];
    let score = 0.1;
    keywords.forEach(word => {
        if (text.toLowerCase().includes(word)) score += 0.2;
    });
    return Math.min(score, 0.95);
};

router.post('/analyze', upload.single('video'), async (req, res) => {
    try {
        const { patientId, description } = req.body;
        let riskScore = 0;
        let earlyRiskFlag = false;
        let detailedAnalysis = {};

        // 1. Video Analysis via Gemini
        // 1. Video Analysis via Local Python Script (OpenCV/MediaPipe/SHAP)
        if (req.file) {
            console.log("Processing video file locally:", req.file.path);
            const fs = require('fs').promises; // Promisified fs for easier cleanup

            const pythonScriptPath = path.join(__dirname, '../ml_service/video_analysis.py');
            const { spawn } = require('child_process');

            // Promise wrapper for python script execution
            const runAnalysis = () => new Promise((resolve, reject) => {
                // Use 'python' instead of 'py' for better compatibility, or fallback
                const pythonProcess = spawn('python', [pythonScriptPath, req.file.path]);

                let dataString = '';
                let errorString = '';

                pythonProcess.stdout.on('data', (data) => {
                    dataString += data.toString();
                });

                pythonProcess.stderr.on('data', (data) => {
                    errorString += data.toString();
                });

                pythonProcess.on('error', (err) => {
                    reject(new Error(`Failed to start python process: ${err.message}`));
                });

                pythonProcess.on('close', (code) => {
                    if (code !== 0) {
                        reject(new Error(`Python script exited with code ${code}: ${errorString}`));
                    } else {
                        try {
                            // Find the JSON part in stdout (in case of other prints)
                            const jsonMatch = dataString.match(/\{[\s\S]*\}/);
                            if (jsonMatch) {
                                resolve(JSON.parse(jsonMatch[0]));
                            } else {
                                reject(new Error("No JSON output found from analysis script"));
                            }
                        } catch (e) {
                            reject(new Error(`Failed to parse Python output: ${e.message}`));
                        }
                    }
                });
            });

            try {
                const result = await runAnalysis();
                riskScore = result.riskScore;
                earlyRiskFlag = result.earlyRiskFlag;
                detailedAnalysis = result.detailedAnalysis;

                // Merge SHAP and Diagnostic scores if available
                if (result.shapValues) detailedAnalysis.shapValues = result.shapValues;
                if (result.diagnosticScores) detailedAnalysis.diagnosticScores = result.diagnosticScores;
                if (result.explanation) detailedAnalysis.explanation = result.explanation;

                // Cleanup: Delete the uploaded file after successful analysis
                try {
                    await fs.unlink(req.file.path);
                    console.log("Deleted uploaded file:", req.file.path);
                } catch (unlinkError) {
                    console.error("Failed to delete uploaded file:", unlinkError);
                }

            } catch (pyError) {
                console.error("Local Video Analysis Failed:", pyError);

                // Attempt cleanup even on failure
                try {
                    await fs.unlink(req.file.path);
                } catch (e) { /* ignore */ }

                // Fallback to Gemini if local fails? Or just error out?
                // For now, let's try Gemini as backup if available
                if (analyzeVideo) {
                    console.log("Falling back to Gemini analysis...");
                    try {
                        const result = await analyzeVideo(req.file.path, req.file.mimetype);
                        riskScore = result.riskScore;
                        earlyRiskFlag = result.earlyRiskFlag;
                        detailedAnalysis = result.detailedAnalysis || { note: "Analysis completed via Gemini (Fallback)." };
                    } catch (geminiError) {
                        return res.status(500).json({
                            error: "Video analysis failed (Local & Cloud).",
                            details: pyError.message
                        });
                    }
                } else {
                    return res.status(500).json({
                        error: "Video analysis failed.",
                        details: pyError.message
                    });
                }
            }
        }
        // 2. Text Analysis Fallback
        // 2. Text/Questionnaire Analysis via Gemini (Enhanced)
        else if (description || req.body.questionnaire) {
            console.log("Processing text/questionnaire data via Gemini");
            if (analyzeVideo) { // Check if service is loaded (analyzeBehavioralData is in same module)
                try {
                    // Parse questionnaire if it's a string (from FormData)
                    let questionnaireData = {};
                    if (req.body.questionnaire) {
                        try {
                            questionnaireData = JSON.parse(req.body.questionnaire);
                        } catch (e) {
                            console.warn("Failed to parse questionnaire JSON:", e);
                            questionnaireData = { error: "Invalid JSON format" };
                        }
                    }

                    const geminiService = require('../services/gemini'); // Re-import to ensure we get the new function
                    if (geminiService.analyzeBehavioralData) {
                        const result = await geminiService.analyzeBehavioralData(description || "No description provided", questionnaireData);
                        riskScore = result.riskScore;
                        earlyRiskFlag = result.earlyRiskFlag;
                        detailedAnalysis = result.detailedAnalysis;
                    } else {
                        // Fallback if function somehow missing
                        console.warn("analyzeBehavioralData not found, using legacy mock");
                        riskScore = await analyzeTextMock(description);
                        earlyRiskFlag = riskScore > 0.5;
                        detailedAnalysis = { note: "Automated analysis based on text description (Legacy Mock)." };
                    }
                } catch (geminiError) {
                    console.error("Gemini Text Analysis Failed:", geminiError);
                    return res.status(500).json({
                        error: "Analysis failed. Please check server logs.",
                        details: geminiError.message
                    });
                }
            } else {
                riskScore = await analyzeTextMock(description);
                earlyRiskFlag = riskScore > 0.5;
                detailedAnalysis = { note: "Service unavailable. Using offline mock analysis." };
            }
        } else {
            return res.status(400).json({ error: "Please provide a video file, text description, or questionnaire." });
        }

        // Save to Database
        const screening = await Screening.create({
            patientId,
            videoDescription: description || "Video Upload Analysis",
            riskScore,
            earlyRiskFlag,
            detailedAnalysis
        });

        res.json(screening);

    } catch (error) {
        console.error("Screening Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
