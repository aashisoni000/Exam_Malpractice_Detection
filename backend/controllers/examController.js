const examService = require('../services/examService');
const { sendSuccess } = require('../utils/responseHelper');

exports.getExams = async (req, res, next) => {
  try {
    const data = await examService.getAllExams();
    sendSuccess(res, { exams: data }, 'Exams retrieved successfully');
  } catch (err) {
    next(err);
  }
};

exports.createExam = async (req, res, next) => {
  console.log("Create Exam Payload:", req.body);
  try {
    const data = await examService.createExam(req.body);
    // Explicit 201 Created as requested by user instructions
    res.status(201).json({
      message: "Exam created successfully",
      exam_id: data.exam_id,
      data: data // returning full object for frontend legacy support
    });
  } catch (err) {
    console.error("Create Exam Error:", err);
    res.status(500).json({
      error: "Failed to create exam"
    });
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
