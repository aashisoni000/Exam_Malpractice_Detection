require('dotenv').config();
const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const examRoutes = require('./routes/examRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Connect to MySQL
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/reports', reportRoutes);

// Error Handling
app.use(errorMiddleware);

const PORT = env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
