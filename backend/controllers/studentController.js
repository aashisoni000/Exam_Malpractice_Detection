const studentService = require('../services/studentService');
const { sendSuccess } = require('../utils/responseHelper');

exports.getStudents = async (req, res, next) => {
  try {
    const data = await studentService.getAllStudents();
    sendSuccess(res, { students: data }, 'Students retrieved successfully');
  } catch (err) {
    next(err);
  }
};
