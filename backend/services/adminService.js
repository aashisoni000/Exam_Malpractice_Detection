const { pool } = require('../config/db');
const { calculateRisk } = require('../utils/riskEngine');

/**
 * Get all active exam sessions with risk scoring
 */
exports.getLiveSessions = async () => {
  const [sessions] = await pool.query(`
    SELECT 
      ea.attempt_id,
      ea.student_id,
      s.name as student_name,
      e.subject_name,
      ea.start_time
    FROM Exam_Attempt ea
    JOIN Exam e ON ea.exam_id = e.exam_id
    JOIN Student s ON ea.student_id = s.student_id
    WHERE ea.end_time IS NULL
    ORDER BY ea.start_time DESC
  `);

  // Enhance with live risk scoring
  const enhancedSessions = await Promise.all(sessions.map(async (s) => {
    const [reports] = await pool.query('SELECT reason FROM Suspicion_Report WHERE attempt_id = ?', [s.attempt_id]);
    const { risk_score, risk_level } = calculateRisk(reports);
    return { 
      ...s, 
      violation_count: reports.length,
      risk_score,
      risk_level
    };
  }));

  return enhancedSessions;
};

/**
 * Get activity for a specific session
 */
exports.getSessionActivity = async (attemptId) => {
  const [activity] = await pool.query(`
    SELECT 
      reason,
      severity,
      reported_time
    FROM Suspicion_Report
    WHERE attempt_id = ?
    ORDER BY reported_time DESC
  `, [attemptId]);
  return activity;
};

/**
 * Terminate a session
 */
exports.terminateSession = async (attemptId) => {
  await pool.query(`
    UPDATE Exam_Attempt 
    SET end_time = NOW() 
    WHERE attempt_id = ?
  `, [attemptId]);
  return { success: true };
};

/**
 * Get global live stats
 */
exports.getLiveStats = async () => {
  const [[{ active_sessions }]] = await pool.query('SELECT COUNT(*) as active_sessions FROM Exam_Attempt WHERE end_time IS NULL');
  const [[{ total_violations }]] = await pool.query('SELECT COUNT(*) as total_violations FROM Suspicion_Report');
  
  // High risk students defined as score >= 16
  const [attempts] = await pool.query('SELECT attempt_id FROM Exam_Attempt WHERE end_time IS NULL');
  let highRiskCount = 0;
  for (const a of attempts) {
    const [reports] = await pool.query('SELECT reason FROM Suspicion_Report WHERE attempt_id = ?', [a.attempt_id]);
    const { risk_score } = calculateRisk(reports);
    if (risk_score >= 16) highRiskCount++;
  }
  
  return {
    active_sessions,
    total_violations,
    high_risk_students: highRiskCount
  };
};

/**
 * Custom function for individual risk check (e.g. for student dashboard)
 */
exports.getStudentRiskScore = async (studentId) => {
  const [[latestAttempt]] = await pool.query(`
    SELECT attempt_id 
    FROM Exam_Attempt 
    WHERE student_id = ? 
    ORDER BY start_time DESC LIMIT 1
  `, [studentId]);

  if (!latestAttempt) return { risk_score: 0, risk_level: 'Safe' };

  const [reports] = await pool.query('SELECT reason FROM Suspicion_Report WHERE attempt_id = ?', [latestAttempt.attempt_id]);
  return calculateRisk(reports);
};

