const { pool } = require('../config/db');

const getAllExams = async () => {
  const [rows] = await pool.query('SELECT * FROM Exam');
  return rows;
};

const createExam = async (examData) => {
  const { subject_name, exam_date, duration_minutes } = examData;
  const [result] = await pool.query(
    'INSERT INTO Exam (subject_name, exam_date, duration_minutes) VALUES (?, ?, ?)',
    [subject_name, exam_date, duration_minutes]
  );
  return { exam_id: result.insertId, subject_name, exam_date, duration_minutes };
};

const startExam = async (student_id, exam_id, ip_address) => {
  try {
    // 0. Safety Check
    const [existing] = await pool.query(
      `SELECT attempt_id FROM Exam_Attempt 
       WHERE student_id = ? AND exam_id = ? AND end_time IS NULL 
       LIMIT 1`,
      [student_id, exam_id]
    );

    if (existing.length > 0) {
      return { attempt_id: existing[0].attempt_id, student_id, exam_id };
    }

    // 1. Insert Exam_Attempt first (Critical)
    const [attemptResult] = await pool.query(
      'INSERT INTO Exam_Attempt (student_id, exam_id, start_time, total_time_minutes) VALUES (?, ?, NOW(), 0)',
      [student_id, exam_id]
    );
    const attempt_id = attemptResult.insertId;
    console.log("Attempt created:", attempt_id);

    // 2. Log IP separately with retry logic
    try {
      await pool.query(
        'INSERT INTO IP_Log (attempt_id, ip_address, log_time) VALUES (?, ?, NOW())',
        [attempt_id, ip_address]
      );
      console.log("IP logged for attempt:", attempt_id);
    } catch (ipErr) {
      console.error('[SERVICE_WARNING] Failed to log initial IP:', ipErr.message);
    }

    return { attempt_id, student_id, exam_id };
  } catch (err) {
    console.error('[SQL_ERROR] Failed to start exam:', err.message);
    throw err;
  }
};

const submitExam = async (attempt_id, answers_text, ip_address) => {
  if (!attempt_id) {
    throw new Error('Invalid session: attempt_id is required');
  }

  try {
    console.log("Submitting attempt:", attempt_id);
    
    // 1. Check if submission already exists (CRITICAL)
    const [existing] = await pool.query(
      'SELECT submission_id FROM Submission WHERE attempt_id = ?',
      [attempt_id]
    );

    if (existing.length > 0) {
      console.log("Submission already exists for attempt:", attempt_id);
      return { success: true, message: 'Submission already exists', submission_id: existing[0].submission_id };
    }

    // 2. Update Exam_Attempt end time
    await pool.query(
      `UPDATE Exam_Attempt
       SET end_time = NOW(),
           total_time_minutes = TIMESTAMPDIFF(MINUTE, start_time, NOW())
       WHERE attempt_id = ?`,
      [attempt_id]
    );

    // 3. Insert Submission (Safe Insert)
    const [result] = await pool.query(
      `INSERT INTO Submission (attempt_id, answers_text, submission_time, answers_json) 
       VALUES (?, ?, NOW(), ?)
       ON DUPLICATE KEY UPDATE 
       answers_text = VALUES(answers_text),
       answers_json = VALUES(answers_json)`,
      [attempt_id, answers_text, answers_text]
    );

    // 4. Log IP on submit (with retry logic)
    try {
      await pool.query(
        'INSERT INTO IP_Log (attempt_id, ip_address, log_time) VALUES (?, ?, NOW())',
        [attempt_id, ip_address]
      );
    } catch (ipErr) {
      console.error('[SERVICE_WARNING] Failed to log submission IP:', ipErr.message);
    }

    return { submission_id: result.insertId || (existing[0] ? existing[0].submission_id : null), attempt_id };
  } catch (err) {
    console.error('[SQL_ERROR] Failed to submit exam:', err.message);
    throw err;
  }
};

module.exports = { getAllExams, createExam, startExam, submitExam };
