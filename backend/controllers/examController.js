const examService = require('../services/examService');
const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHelper');

exports.getExams = async (req, res, next) => {
  try {
    const data = await examService.getAllExams(req.user);
    if (req.user && req.user.role === 'student') {
      console.log("Student exam count:", data.length);
    }
    sendSuccess(res, { exams: data }, 'Exams retrieved successfully');
  } catch (err) {
    next(err);
  }
};

exports.createExam = async (req, res, next) => {
  console.log("Create Exam Request:", req.body);

  const { subject_name, exam_date, duration_minutes } = req.body;

  if (!subject_name || !exam_date || !duration_minutes) {
    return sendError(res, "Missing required fields", 400);
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO Exam (subject_name, exam_date, duration_minutes) VALUES (?, ?, ?)`,
      [subject_name, exam_date, duration_minutes]
    );

    return sendSuccess(res, {
      exam_id: result.insertId
    }, "Exam created successfully", 201);
  } catch (err) {
    console.error("Create Exam Error:", err);
    return sendError(res, "Failed to create exam", 500);
  }
};

exports.startExam = async (req, res, next) => {
  try {
    const { student_id, exam_id } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;
    const data = await examService.startExam(student_id, exam_id, ip_address);
    sendSuccess(res, data, 'Exam started successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.submitExam = async (req, res, next) => {
  try {
    const { attempt_id, answers_text } = req.body;
    
    if (!attempt_id) {
      return res.status(400).json({ status: 'error', message: 'Invalid session: attempt_id is required' });
    }

    const ip_address = req.ip || req.connection.remoteAddress;
    const data = await examService.submitExam(attempt_id, answers_text, ip_address);
    sendSuccess(res, data, 'Exam submitted successfully');
  } catch (err) {
    next(err);
  }
};

exports.assignStudentsToExam = async (req, res, next) => {
  try {
    const { exam_id, student_ids } = req.body;
    
    if (!exam_id || !student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Exam ID and student_ids array are required.' 
      });
    }

    const result = await examService.assignStudents(exam_id, student_ids);
    sendSuccess(res, result, 'Students assigned successfully');
  } catch (err) {
    next(err);
  }
};
