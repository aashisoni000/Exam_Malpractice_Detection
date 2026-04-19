const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const data = await authService.login(email, password, role);
    sendSuccess(res, data, 'Login successful');
  } catch (err) {
    next(err);
  }
};
