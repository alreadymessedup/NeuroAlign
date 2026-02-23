const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './neuroalign.db'
});

// User model (for auth)
const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('parent', 'doctor'), allowNull: false }
});

const Patient = sequelize.define('Patient', {
    name: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER },
    parentEmail: { type: DataTypes.STRING }
});

const Screening = sequelize.define('Screening', {
    videoDescription: { type: DataTypes.TEXT },
    riskScore: { type: DataTypes.FLOAT },
    earlyRiskFlag: { type: DataTypes.BOOLEAN },
    detailedAnalysis: { type: DataTypes.JSON }
});

const Diagnosis = sequelize.define('Diagnosis', {
    jointAttentionScore: { type: DataTypes.FLOAT },
    motorCoordinationScore: { type: DataTypes.FLOAT },
    clinicianNotes: { type: DataTypes.TEXT }
});

const TherapySession = sequelize.define('TherapySession', {
    type: { type: DataTypes.STRING }, // Speech, Motor, Cognitive
    sessionDate: { type: DataTypes.DATE },
    progressScore: { type: DataTypes.FLOAT },
    planUpdateNeeded: { type: DataTypes.BOOLEAN }
});

const MonitoringLog = sequelize.define('MonitoringLog', {
    alertType: { type: DataTypes.STRING },
    message: { type: DataTypes.STRING }
});

// Associations
Patient.hasMany(Screening);
Patient.hasMany(Diagnosis);
Patient.hasMany(TherapySession);
Patient.hasMany(MonitoringLog);

module.exports = {
    sequelize,
    User,
    Patient,
    Screening,
    Diagnosis,
    TherapySession,
    MonitoringLog
};
