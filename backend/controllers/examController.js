// controllers/examController.js
// Handles all exam-related business logic.
// DB queries use the mysql2 promise pool from db/db.js.
// Each handler is self-contained and importable independently.

const db = require('../db/db');

// ─── Helper: get real client IP (handles proxies) ────────────────────────────
const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.socket?.remoteAddress ||
  req.ip ||
  '0.0.0.0';
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/exams
 * Create a new exam.
 * Body: { subject_name, exam_date, duration_minutes }
 */
const createExam = async (req, res) => {
  try {
    const { subject_name, exam_date, duration_minutes } = req.body;

    if (!subject_name || !exam_date || !duration_minutes) {
      return res.status(400).json({
        success: false,
        message: 'subject_name, exam_date, and duration_minutes are required.',
      });
    }

    const [result] = await db.execute(
      'INSERT INTO Exam (subject_name, exam_date, duration_minutes) VALUES (?, ?, ?)',
      [subject_name, exam_date, parseInt(duration_minutes)]
    );

    return res.status(201).json({
      success: true,
      message: `Exam "${subject_name}" created successfully.`,
      exam_id: result.insertId,
    });
  } catch (err) {
    console.error('[Exam] createExam error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to create exam.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/exams
 * Return all exams ordered by date descending.
 */
const getAllExams = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM Exam ORDER BY exam_date DESC'
    );
    return res.json({ success: true, exams: rows });
  } catch (err) {
    console.error('[Exam] getAllExams error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch exams.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/exams/student/:student_id
 * Return exams available to a specific student (all exams for now).
 * Future: filter by student enrollments.
 */
const getExamsForStudent = async (req, res) => {
  try {
    const { student_id } = req.params;

    // For now returns all exams; filter by enrollment later
    const [rows] = await db.execute(
      'SELECT * FROM Exam ORDER BY exam_date DESC'
    );

    return res.json({ success: true, student_id, exams: rows });
  } catch (err) {
    console.error('[Exam] getExamsForStudent error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch student exams.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/exams/start
 * Start an exam attempt and log the student's IP.
 * Body: { student_id, exam_id }
 */
const startExam = async (req, res) => {
  try {
    const { student_id, exam_id } = req.body;
    const ip_address = getClientIp(req);

    if (!student_id || !exam_id) {
      return res.status(400).json({
        success: false,
        message: 'student_id and exam_id are required.',
      });
    }

    // Check for an existing incomplete attempt (prevent duplicate starts)
    const [existing] = await db.execute(
      'SELECT attempt_id FROM Exam_Attempt WHERE student_id = ? AND exam_id = ? AND end_time IS NULL',
      [student_id, exam_id]
    );

    if (existing.length > 0) {
      return res.json({
        success: true,
        message: 'Resuming existing attempt.',
        attempt_id: existing[0].attempt_id,
        resumed: true,
      });
    }

    // Insert new attempt
    const [attemptResult] = await db.execute(
      'INSERT INTO Exam_Attempt (student_id, exam_id, start_time) VALUES (?, ?, NOW())',
      [student_id, exam_id]
    );

    const attempt_id = attemptResult.insertId;

    // Log IP for exam start
    await db.execute(
      'INSERT INTO IP_Log (attempt_id, ip_address, log_time, event_type) VALUES (?, ?, NOW(), ?)',
      [attempt_id, ip_address, 'exam_start']
    );

    return res.status(201).json({
      success: true,
      message: 'Exam started successfully.',
      attempt_id,
      resumed: false,
    });
  } catch (err) {
    console.error('[Exam] startExam error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to start exam.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/exams/submit
 * Submit exam answers and close the attempt.
 * Body: { attempt_id, answers_text }
 */
const submitExam = async (req, res) => {
  try {
    const { attempt_id, answers_text } = req.body;
    const ip_address = getClientIp(req);

    if (!attempt_id) {
      return res.status(400).json({
        success: false,
        message: 'attempt_id is required.',
      });
    }

    // Fetch attempt to calculate duration
    const [attempts] = await db.execute(
      'SELECT * FROM Exam_Attempt WHERE attempt_id = ?',
      [attempt_id]
    );

    if (!attempts.length) {
      return res.status(404).json({ success: false, message: 'Attempt not found.' });
    }

    const attempt = attempts[0];

    if (attempt.end_time) {
      return res.status(409).json({ success: false, message: 'Exam already submitted.' });
    }

    const now = new Date();
    const startTime = new Date(attempt.start_time);
    const totalMinutes = Math.round((now - startTime) / 60000);

    // Close the attempt
    await db.execute(
      'UPDATE Exam_Attempt SET end_time = NOW(), total_time_minutes = ? WHERE attempt_id = ?',
      [totalMinutes, attempt_id]
    );

    // Insert submission record
    await db.execute(
      'INSERT INTO Submission (attempt_id, answers_text, submission_time) VALUES (?, ?, NOW())',
      [attempt_id, answers_text || '']
    );

    // Log IP for submission
    await db.execute(
      'INSERT INTO IP_Log (attempt_id, ip_address, log_time, event_type) VALUES (?, ?, NOW(), ?)',
      [attempt_id, ip_address, 'exam_submit']
    );

    return res.json({
      success: true,
      message: 'Exam submitted successfully.',
      total_time_minutes: totalMinutes,
    });
  } catch (err) {
    console.error('[Exam] submitExam error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to submit exam.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/exams/log-event
 * Log a suspicious event during an exam (e.g. tab switch).
 * Body: { attempt_id, reason, severity }
 */
const logSuspicionEvent = async (req, res) => {
  try {
    const { attempt_id, reason, severity } = req.body;

    if (!attempt_id || !reason) {
      return res.status(400).json({
        success: false,
        message: 'attempt_id and reason are required.',
      });
    }

    const validSeverities = ['Low', 'Medium', 'High'];
    const safeSeverity = validSeverities.includes(severity) ? severity : 'Medium';

    await db.execute(
      'INSERT INTO Suspicion_Report (attempt_id, reason, severity, reported_at) VALUES (?, ?, ?, NOW())',
      [attempt_id, reason, safeSeverity]
    );

    return res.json({
      success: true,
      message: 'Suspicion event logged.',
    });
  } catch (err) {
    console.error('[Exam] logSuspicionEvent error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to log event.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  createExam,
  getAllExams,
  getExamsForStudent,
  startExam,
  submitExam,
  logSuspicionEvent,
};
