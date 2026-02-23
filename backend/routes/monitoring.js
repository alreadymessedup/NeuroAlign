const express = require('express');
const router = express.Router();
const { TherapySession, MonitoringLog } = require('../models');

router.get('/:patientId', async (req, res) => {
    try {
        const history = await TherapySession.findAll({
            where: { patientId: req.params.patientId },
            order: [['createdAt', 'ASC']]
        });

        const alerts = await MonitoringLog.findAll({
            where: { patientId: req.params.patientId }
        });

        res.json({ history, alerts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
