const fs = require('fs');

function generateData() {
    const data = {
        metadata: {
            subject_id: "SUB-2024-001",
            age_months: 36,
            session_duration_seconds: 10,
            frame_rate: 10
        },
        timeline: [],
        summary_stats: {}
    };

    const totalFrames = 100;
    let caregiverGazeCount = 0;

    for (let i = 0; i < totalFrames; i++) {
        const timestamp = parseFloat((i * 0.1).toFixed(1));

        // Gaze Generation (85% Non-Caregiver)
        const rand = Math.random();
        let gaze;
        if (rand < 0.45) gaze = "Stimulus";
        else if (rand < 0.85) gaze = "Void";
        else gaze = "Caregiver";

        if (gaze === "Caregiver") caregiverGazeCount++;

        // Hand Flapping (Frames 40-70)
        const handFlapping = (i >= 40 && i <= 70);

        // Body Orientation (100-260 degrees)
        const bodyAngle = Math.floor(Math.random() * (260 - 100 + 1)) + 100;

        data.timeline.push({
            frame_id: i,
            timestamp: timestamp,
            gaze_target: gaze,
            hand_flapping_detected: handFlapping,
            body_orientation_angle: bodyAngle
        });
    }

    // Summary Stats
    const jointAttentionRatio = caregiverGazeCount / totalFrames;

    let riskScore = 0;
    if (jointAttentionRatio < 0.2) riskScore += 40;
    if (jointAttentionRatio < 0.1) riskScore += 20;
    if (data.timeline.some(f => f.hand_flapping_detected)) riskScore += 30;
    riskScore += Math.floor(Math.random() * 11);

    data.summary_stats = {
        joint_attention_ratio: jointAttentionRatio,
        risk_score: Math.min(riskScore, 100)
    };

    return data;
}

const dataset = generateData();
fs.writeFileSync('synthetic_screening_data.json', JSON.stringify(dataset, null, 2));
console.log('Dataset generated: synthetic_screening_data.json');
