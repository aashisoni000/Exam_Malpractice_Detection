const { pool } = require('../config/db');

exports.getStats = async () => {
  const [[{ total_students }]] = await pool.query('SELECT COUNT(*) as total_students FROM Student');
  const [[{ total_exams }]] = await pool.query('SELECT COUNT(*) as total_exams FROM Exam');
  const [[{ total_attempts }]] = await pool.query('SELECT COUNT(*) as total_attempts FROM Exam_Attempt');
  const [[{ total_reports }]] = await pool.query('SELECT COUNT(*) as total_reports FROM Suspicion_Report');
  const [[{ high_risk_count }]] = await pool.query("SELECT COUNT(*) as high_risk_count FROM Suspicion_Report WHERE severity='High'");

  return { total_students, total_exams, total_attempts, total_reports, high_risk_count };
};

exports.getCharts = async () => {
  // Severity Distribution
  const [severityRows] = await pool.query('SELECT severity as name, COUNT(*) as value FROM Suspicion_Report GROUP BY severity');
  
  // Subject-wise Attempts
  const [subjectRows] = await pool.query(`
    SELECT e.subject_name as subject, COUNT(ea.attempt_id) as attempts 
    FROM Exam e 
    JOIN Exam_Attempt ea ON e.exam_id = ea.exam_id 
    GROUP BY e.subject_name
  `);

  return {
    severityDistribution: severityRows,
    subjectAttempts: subjectRows
  };
};

exports.getRecentReports = async () => {
  const [recentReports] = await pool.query(`
    SELECT 
      sr.report_id, 
      sr.reason, 
      sr.severity, 
      sr.reported_time as report_time, 
      s.name as student_name, 
      e.subject_name as exam_name
    FROM Suspicion_Report sr
    JOIN Exam_Attempt ea ON sr.attempt_id = ea.attempt_id
    JOIN Student s ON ea.student_id = s.student_id
    JOIN Exam e ON ea.exam_id = e.exam_id
    ORDER BY sr.reported_time DESC
    LIMIT 10
  `);
  
  return recentReports;
};
