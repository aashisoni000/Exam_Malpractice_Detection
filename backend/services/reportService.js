const { pool } = require('../config/db');

const getAllReports = async () => {
  const [rows] = await pool.query(`
    SELECT
      sr.report_id,
      ea.student_id,
      ea.exam_id,
      s.name,
      e.subject_name,
      sr.reason,
      sr.severity,
      sr.reported_time
    FROM Suspicion_Report sr
    JOIN Exam_Attempt ea ON sr.attempt_id = ea.attempt_id
    JOIN Student s ON ea.student_id = s.student_id
    JOIN Exam e ON ea.exam_id = e.exam_id
    ORDER BY sr.reported_time DESC
  `);
  return rows;
};

module.exports = { getAllReports };
