const express = require('express');
const router = express.Router();
const { TherapySession } = require('../models');
const { Op } = require('sequelize');

router.post('/session', async (req, res) => {
    try {
        const { patientId, type, progressScore } = req.body;

        // Check last 3 sessions for dynamic adaptation logic
        const lastSessions = await TherapySession.findAll({
            where: { patientId, type },
            order: [['createdAt', 'DESC']],
            limit: 3
        });

        let planUpdateNeeded = false;
        if (lastSessions.length >= 2) {
            const recentProgress = lastSessions.map(s => s.progressScore);
            const avgProgress = (recentProgress.reduce((a, b) => a + b, 0) + progressScore) / (recentProgress.length + 1);
            // If average progress is low (mock logic: < 30%), flag update
            if (avgProgress < 30) planUpdateNeeded = true;
        }

        const session = await TherapySession.create({
            patientId,
            type,
            progressScore,
            planUpdateNeeded,
            sessionDate: new Date()
        });

        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
