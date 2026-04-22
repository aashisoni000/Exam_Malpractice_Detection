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
  // Insert Exam_Attempt
  const [attemptResult] = await pool.query(
    'INSERT INTO Exam_Attempt (student_id, exam_id, start_time, end_time, total_time_minutes) VALUES (?, ?, NOW(), NOW(), 0)',
    [student_id, exam_id]
  );
  const attempt_id = attemptResult.insertId;

  // Log IP
  await pool.query(
    'INSERT INTO IP_Log (attempt_id, ip_address) VALUES (?, ?)',
    [attempt_id, ip_address]
  );

  return { attempt_id, student_id, exam_id };
};

const submitExam = async (attempt_id, answers_text, ip_address) => {
  // Update Exam_Attempt end time
  await pool.query(
    `UPDATE Exam_Attempt
     SET end_time = NOW(),
         total_time_minutes = TIMESTAMPDIFF(MINUTE, start_time, NOW())
     WHERE attempt_id = ?`,
    [attempt_id]
  );

  // Insert Submission - using answers_text for legacy support and answers_json for new logic
  const [result] = await pool.query(
    'INSERT INTO Submission (attempt_id, answers_text, submission_time, answers_json) VALUES (?, ?, NOW(), ?)',
    [attempt_id, answers_text, answers_text]
  );

  // Log IP on submit
  await pool.query(
    'INSERT INTO IP_Log (attempt_id, ip_address) VALUES (?, ?)',
    [attempt_id, ip_address]
  );

  return { submission_id: result.insertId, attempt_id };
};

module.exports = { getAllExams, createExam, startExam, submitExam };
