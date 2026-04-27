const studentService = require('../services/studentService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

exports.getStudents = async (req, res, next) => {
  try {
    const data = await studentService.getAllStudents();
    sendSuccess(res, { students: data }, 'Students retrieved successfully');
  } catch (err) {
    next(err);
  }
};

exports.getDashboard = async (req, res, next) => {
  try {
    const { student_id } = req.params;
    if (!student_id) {
      return sendError(res, 'Student ID is required', 400);
    }
    const data = await studentService.getStudentDashboard(student_id);
    // Note: The UI expects the data exactly without nesting, or nested in standard way. 
    // We use responseHelper, which usually wraps it. E.g. { success: true, data: data }
    sendSuccess(res, data, 'Student dashboard retrieved successfully');
  } catch (err) {
    next(err);
  }
};
