const adminService = require('../services/adminService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

exports.getLiveSessions = async (req, res, next) => {
  try {
    const sessions = await adminService.getLiveSessions();
    sendSuccess(res, sessions, 'Live sessions retrieved');
  } catch (err) {
    next(err);
  }
};

exports.getSessionActivity = async (req, res, next) => {
  try {
    const { attempt_id } = req.params;
    const activity = await adminService.getSessionActivity(attempt_id);
    sendSuccess(res, activity, 'Session activity retrieved');
  } catch (err) {
    next(err);
  }
};

exports.terminateSession = async (req, res, next) => {
  try {
    const { attempt_id } = req.body;
    if (!attempt_id) return sendError(res, 'Attempt ID required', 400);
    
    await adminService.terminateSession(attempt_id);
    sendSuccess(res, null, 'Session terminated successfully');
  } catch (err) {
    next(err);
  }
};

exports.getLiveStats = async (req, res, next) => {
  try {
    const stats = await adminService.getLiveStats();
    sendSuccess(res, stats, 'Live stats retrieved');
  } catch (err) {
    next(err);
  }
};
