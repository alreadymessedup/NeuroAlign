const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fs = require("fs");
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

async function uploadToGemini(path, mimeType) {
    const uploadResult = await fileManager.uploadFile(path, {
        mimeType,
        displayName: path,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
}

async function analyzeVideo(filePath, mimeType) {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }

    try {
        // 1. Upload the video
        const file = await uploadToGemini(filePath, mimeType);

        // 2. Wait for processing (simple polling)
        let processedFile = await fileManager.getFile(file.name);
        while (processedFile.state === "PROCESSING") {
            console.log("Processing video...");
            await new Promise((resolve) => setTimeout(resolve, 2000));
            processedFile = await fileManager.getFile(file.name);
        }

        if (processedFile.state === "FAILED") {
            throw new Error("Video processing failed.");
        }

        // 3. Generate Content
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
      Analyze this video of a child for early signs of autism or developmental delays.
      Focus on:
      1. Eye contact and gaze (e.g., avoidance, tracking).
      2. Motor behaviors (e.g., repetitive movements, flapping, coordination).
      3. Social interaction cues.
      
      Return a JSON object with the following structure:
      {
        "riskScore": (float between 0.0 and 1.0),
        "earlyRiskFlag": (boolean),
        "detailedAnalysis": {
           "eyeGaze": "description...",
           "motorSkills": "description...",
           "social": "description...",
           "summary": "overall summary"
        }
      }
      ONLY return the JSON object. Do not wrap in markdown code blocks.
    `;

        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: processedFile.mimeType,
                    fileUri: processedFile.uri
                }
            },
            { text: prompt },
        ]);

        const responseText = result.response.text();
        console.log("Gemini Response:", responseText);

        // Cleanup: Parse JSON
        try {
            const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", e);
            return {
                riskScore: 0,
                earlyRiskFlag: false,
                detailedAnalysis: { summary: "Analysis failed to produce structured data. Raw: " + responseText }
            };
        }

    } catch (error) {
        console.error("Error in Gemini Analysis:", error);
        throw error;
    } finally {
        // Optional: Delete file from Gemini after use to save storage?
        // await fileManager.deleteFile(file.name);
        // Clean up local upload
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting local file:", err);
        });
    }
}

async function analyzeBehavioralData(description, questionnaire) {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set.");
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let prompt = `
      Analyze the following behavioral data of a child for early signs of autism or developmental delays.
      
      **Caregiver Observation:**
      "${description}"

      **M-CHAT-R/F Questionnaire Responses:**
      ${JSON.stringify(questionnaire, null, 2)}
      
      Focus on:
      1. Consistency between observation and questionnaire.
      2. Specific red flags in eye contact, social reciprocity, and motor behaviors.
      3. Intensity of the described behaviors.

      Return a JSON object with the following structure:
      {
        "riskScore": (float between 0.0 and 1.0),
        "earlyRiskFlag": (boolean),
        "detailedAnalysis": {
           "eyeGaze": "Analysis of eye contact...",
           "social": "Analysis of social interaction...",
           "motorSkills": "Analysis of motor behaviors...",
           "summary": "Comprehensive summary of findings..."
        }
      }
      ONLY return the JSON object. Do not wrap in markdown code blocks.
    `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        console.log("Gemini Text Analysis Response:", responseText);

        try {
            const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", e);
            throw new Error("Failed to parse AI response");
        }

    } catch (error) {
        console.error("Error in Gemini Text Analysis:", error);
        throw error;
    }
}

module.exports = { analyzeVideo, analyzeBehavioralData };
