const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure Multer for video uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Use a unique name to avoid collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

/**
 * @route   POST /api/analysis/analyze-video
 * @desc    Upload video and analyze using Python ML service
 * @access  Public
 */
router.post('/analyze-video', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded' });
    }

    const videoPath = req.file.path;
    const pythonScriptPath = path.join(__dirname, '../ml_service/video_analysis.py');

    console.log(`Starting analysis for: ${videoPath}`);

    // Spawn Python process
    // NOTE: using 'py' launcher for Windows compatibility
    const pythonProcess = spawn('py', [pythonScriptPath, videoPath]);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
        console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Child process exited with code ${code}`);

        // Clean up uploaded file? 
        // For now, let's keep it for debugging or future training data.
        // fs.unlinkSync(videoPath); 

        if (code !== 0) {
            return res.status(500).json({
                error: 'Analysis failed',
                details: errorString
            });
        }

        try {
            // Attempt to parse JSON output from Python script
            const results = JSON.parse(dataString);
            res.json(results);
        } catch (err) {
            console.error('Failed to parse Python output:', dataString);
            res.status(500).json({
                error: 'Failed to parse analysis results',
                rawOutput: dataString
            });
        }
    });
});

module.exports = router;
