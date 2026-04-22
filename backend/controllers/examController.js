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
  try {
    const data = await examService.createExam(req.body);
    sendSuccess(res, { exam: data }, 'Exam created successfully', 201);
  } catch (err) {
    next(err);
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
    const ip_address = req.ip || req.connection.remoteAddress;
    const data = await examService.submitExam(attempt_id, answers_text, ip_address);
    sendSuccess(res, data, 'Exam submitted successfully');
  } catch (err) {
    next(err);
  }
};
