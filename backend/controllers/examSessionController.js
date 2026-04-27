const examSessionService = require('../services/examSessionService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Initialize a new exam session
 */
exports.startExam = async (req, res, next) => {
  try {
    const { student_id, exam_id } = req.body;
    
    // Explicit Validation
    if (!student_id || !exam_id) {
      return sendError(res, 'Missing student_id or exam_id', 400);
    }

    const ip = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress;

    const data = await examSessionService.startExam(student_id, exam_id, ip);
    
    sendSuccess(res, data, 'Exam session started');
  } catch (err) {
    console.error('[CONTROLLER_ERROR] startExam:', err.message);
    next(err);
  }
};

/**
 * End an existing exam session
 */
exports.endExam = async (req, res, next) => {
  try {
    const { attempt_id } = req.body;
    
    if (!attempt_id) {
      return sendError(res, 'Missing attempt_id', 400);
    }

    const data = await examSessionService.endExam(attempt_id);
    
    sendSuccess(res, data, 'Exam session closed');
  } catch (err) {
    console.error('[CONTROLLER_ERROR] endExam:', err.message);
    next(err);
  }
};

/**
 * Continuous IP logging for multi-device detection
 */
exports.logIp = async (req, res, next) => {
  try {
    const { attempt_id } = req.body;
    
    if (!attempt_id) {
      return sendError(res, 'Missing attempt_id', 400);
    }

    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip;

    const data = await examSessionService.logIpDuringExam(attempt_id, ip);
    
    sendSuccess(res, data, 'IP telemetry recorded');
  } catch (err) {
    console.error('[CONTROLLER_ERROR] logIp:', err.message);
    next(err);
  }
};

/**
 * Log specific suspicion events (Tab Switch, Idle, Network)
 */
exports.logEvent = async (req, res, next) => {
  try {
    const { attempt_id, reason } = req.body;
    
    if (!attempt_id || !reason) {
      return sendError(res, 'Missing attempt_id or reason', 400);
    }

    const data = await examSessionService.logSuspicionEvent(attempt_id, reason);
    
    sendSuccess(res, data, 'Integrity event processed');
  } catch (err) {
    console.error('[CONTROLLER_ERROR] logEvent:', err.message);
    next(err);
  }
};



