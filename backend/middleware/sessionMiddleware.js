const { pool } = require('../config/db');
const { sendError } = require('../utils/responseHelper');

/**
 * Middleware to validate that an exam session is still active and valid.
 */
exports.validateActiveSession = async (req, res, next) => {
  try {
    const attemptId = req.body.attempt_id || req.params.attempt_id || req.query.attempt_id;
    
    if (!attemptId) {
      return sendError(res, 'Attempt ID is required for this operation', 400);
    }

    const [rows] = await pool.query(
      'SELECT end_time FROM Exam_Attempt WHERE attempt_id = ?',
      [attemptId]
    );

    if (rows.length === 0) {
      return sendError(res, 'Invalid attempt ID - session does not exist', 404);
    }

    if (rows[0].end_time !== null) {
      return sendError(res, 'Session has already been terminated', 403);
    }

    next();
  } catch (err) {
    console.error('[SESSION_VALIDATION_ERROR]', err.message);
    return sendError(res, 'Session validation failed', 500);
  }
};
