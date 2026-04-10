// routes/examRoutes.js
// All exam-related API routes.
// Mounted at /api/exams in server.js

const express = require('express');
const router = express.Router();
const {
  createExam,
  getAllExams,
  getExamsForStudent,
  startExam,
  submitExam,
  logSuspicionEvent,
} = require('../controllers/examController');

// POST   /api/exams              — Create a new exam
router.post('/', createExam);

// GET    /api/exams              — Get all exams
router.get('/', getAllExams);

// GET    /api/exams/student/:id  — Get exams for a student
router.get('/student/:student_id', getExamsForStudent);

// POST   /api/exams/start        — Start an exam attempt
router.post('/start', startExam);

// POST   /api/exams/submit       — Submit exam answers
router.post('/submit', submitExam);

// POST   /api/exams/log-event    — Log suspicion event (tab switch, etc.)
router.post('/log-event', logSuspicionEvent);

module.exports = router;
