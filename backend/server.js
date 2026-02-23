const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { Sequelize } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup
const { sequelize } = require('./models');

// Routes Placeholder
app.get('/', (req, res) => {
    res.json({ message: "Welcome to NeuroAlign API" });
});

const authRouter = require('./routes/auth');
const screeningRouter = require('./routes/screening');
const diagnosisRouter = require('./routes/diagnosis');
const therapyRouter = require('./routes/therapy');
const monitoringRouter = require('./routes/monitoring');
const analysisRouter = require('./routes/analysis');

app.use('/api/auth', authRouter);
app.use('/api/screening', screeningRouter);
app.use('/api/diagnosis', diagnosisRouter);
app.use('/api/therapy', therapyRouter);
app.use('/api/monitoring', monitoringRouter);
app.use('/api/analysis', analysisRouter);

// Database Sync and Server Start
sequelize.sync().then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
