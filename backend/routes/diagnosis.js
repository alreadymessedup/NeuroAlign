const express = require('express');
const router = express.Router();
const { Diagnosis } = require('../models');

router.get('/:patientId', async (req, res) => {
    try {
        const report = await Diagnosis.findOne({
            where: { patientId: req.params.patientId },
            order: [['createdAt', 'DESC']]
        });
        res.json(report || { message: "No report found" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
