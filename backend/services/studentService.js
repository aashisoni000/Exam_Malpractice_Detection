const { pool } = require('../config/db');

const getAllStudents = async () => {
  const [rows] = await pool.query('SELECT * FROM Student');
  return rows;
};

const getStudentDashboard = async (studentId) => {
  const [[{ count: examsTaken }]] = await pool.query(
    'SELECT COUNT(*) as count FROM Exam_Attempt WHERE student_id = ?',
    [studentId]
  );

  const [[{ count: reportsGenerated }]] = await pool.query(
    `SELECT COUNT(*) as count 
     FROM Suspicion_Report sr 
     JOIN Exam_Attempt ea ON sr.attempt_id = ea.attempt_id 
     WHERE ea.student_id = ?`,
    [studentId]
  );

  const [[{ avg: avgCompletionTime }]] = await pool.query(
    `SELECT ROUND(AVG(total_time_minutes)) as avg 
     FROM Exam_Attempt 
     WHERE student_id = ?`,
    [studentId]
  );

  const [recentExams] = await pool.query(
    `SELECT e.subject_name, ea.start_time 
     FROM Exam_Attempt ea 
     JOIN Exam e ON ea.exam_id = e.exam_id 
     WHERE ea.student_id = ? 
     ORDER BY ea.start_time DESC LIMIT 5`,
    [studentId]
  );

  const [recentReports] = await pool.query(
    `SELECT sr.reason, sr.severity, sr.reported_time 
     FROM Suspicion_Report sr 
     JOIN Exam_Attempt ea ON sr.attempt_id = ea.attempt_id 
     WHERE ea.student_id = ? 
     ORDER BY sr.reported_time DESC LIMIT 5`,
    [studentId]
  );

  const [subjectAttempts] = await pool.query(
    `SELECT e.subject_name as subject, COUNT(*) as count 
     FROM Exam_Attempt ea 
     JOIN Exam e ON ea.exam_id = e.exam_id 
     WHERE ea.student_id = ? 
     GROUP BY e.subject_name`,
    [studentId]
  );

  const [riskDistribution] = await pool.query(
    `SELECT sr.severity, COUNT(*) as count 
     FROM Suspicion_Report sr 
     JOIN Exam_Attempt ea ON sr.attempt_id = ea.attempt_id 
     WHERE ea.student_id = ? 
     GROUP BY sr.severity`,
    [studentId]
  );

  const [attemptsOverTime] = await pool.query(
    `SELECT DATE(start_time) as day, COUNT(*) as count 
     FROM Exam_Attempt 
     WHERE student_id = ? 
     GROUP BY DATE(start_time) 
     ORDER BY day`,
    [studentId]
  );

  // SuspicionFlags can just be the reportsGenerated or we can define it based on highest severity
  // Let's just use reportsGenerated for suspicionFlags based on step 2 response
  // Risk calculation for the student
  const [[latestAttempt]] = await pool.query(
    'SELECT attempt_id FROM Exam_Attempt WHERE student_id = ? ORDER BY start_time DESC LIMIT 1',
    [studentId]
  );
  
  let riskMeta = { risk_score: 0, risk_level: 'Safe' };
  if (latestAttempt) {
    const [reports] = await pool.query('SELECT reason FROM Suspicion_Report WHERE attempt_id = ?', [latestAttempt.attempt_id]);
    const { calculateRisk } = require('../utils/riskEngine');
    riskMeta = calculateRisk(reports);
  }

  return {
    examsTaken,
    reportsGenerated,
    suspicionFlags: reportsGenerated, 
    avgCompletionTime: avgCompletionTime || 0,
    recentExams,
    recentReports,
    subjectAttempts,
    riskDistribution,
    attemptsOverTime,
    ...riskMeta
  };

};

module.exports = { getAllStudents, getStudentDashboard };
