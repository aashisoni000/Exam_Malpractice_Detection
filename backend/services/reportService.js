const { pool } = require("../config/db");

async function getAllReports() {
  try {
    console.log("[REPORT_SERVICE] Fetching reports...");
    const [rows] = await pool.query(`
      SELECT
        sr.report_id,
        sr.reason,
        sr.severity,
        sr.reported_time,
        s.name AS student_name,
        e.subject_name,
        ea.attempt_id
      FROM Suspicion_Report sr
      LEFT JOIN Exam_Attempt ea ON sr.attempt_id = ea.attempt_id
      LEFT JOIN Student s ON ea.student_id = s.student_id
      LEFT JOIN Exam e ON ea.exam_id = e.exam_id
      ORDER BY sr.reported_time DESC
    `);
    console.log("[REPORT_SERVICE] Rows:", rows.length);
    return rows;
  } catch (error) {
    console.error("[REPORT_SERVICE_ERROR]", error);
    throw error;
  }
}

async function getReportsByStudent(studentId) {
  try {
    console.log("[SERVICE] Fetching reports for student:", studentId);
    const [rows] = await pool.query(`
      SELECT
        sr.report_id,
        s.name AS student_name,
        e.subject_name,
        sr.reason,
        sr.severity,
        sr.reported_time
      FROM Suspicion_Report sr
      LEFT JOIN Exam_Attempt ea ON sr.attempt_id = ea.attempt_id
      LEFT JOIN Student s ON ea.student_id = s.student_id
      LEFT JOIN Exam e ON ea.exam_id = e.exam_id
      WHERE ea.student_id = ?
      ORDER BY sr.reported_time DESC
    `, [studentId]);
    console.log("[SERVICE] Reports fetched:", rows.length);
    return rows;
  } catch (error) {
    console.error("[SERVICE_ERROR]", error);
    throw error;
  }
}

module.exports = {
  getAllReports,
  getReportsByStudent
};
