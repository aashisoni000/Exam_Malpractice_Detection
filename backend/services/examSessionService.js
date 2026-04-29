const { pool } = require('../config/db');
const monitor = require('./MonitoringService');

/**
 * Start an exam session
 */
const startExam = async (studentId, examId, ipAddress) => {
  try {
    // 0. Safety Check: Does an unfinished attempt already exist?
    const [existing] = await pool.query(
      `SELECT attempt_id FROM Exam_Attempt 
       WHERE student_id = ? AND exam_id = ? AND end_time IS NULL 
       LIMIT 1`,
      [studentId, examId]
    );

    if (existing.length > 0) {
      console.log("Resuming existing attempt:", existing[0].attempt_id);
      return { attempt_id: existing[0].attempt_id };
    }

    // 1. Insert Exam_Attempt first (Critical)
    const [result] = await pool.query(
      `INSERT INTO Exam_Attempt (student_id, exam_id, start_time, total_time_minutes) 
       VALUES (?, ?, NOW(), 0)`,
      [studentId, examId]
    );
    const attemptId = result.insertId;
    console.log("Attempt created:", attemptId);

    // 2. Log initial IP separately with retry logic (Don't block exam start)
    try {
      await monitor.logIP(attemptId, ipAddress);
      console.log("IP logged for attempt:", attemptId);
    } catch (ipErr) {
      console.error('[SERVICE_WARNING] Failed to log initial IP:', ipErr.message);
      // Continue execution
    }

    return { attempt_id: attemptId };
  } catch (err) {
    console.error('[SQL_ERROR] Failed to start exam:', err.message);
    throw err;
  }
};

/**
 * End an exam session
 */
const endExam = async (attemptId) => {
  try {
    // 1. Update Exam_Attempt with end_time and duration
    await pool.query(
      `UPDATE Exam_Attempt 
       SET end_time = NOW(), 
           total_time_minutes = TIMESTAMPDIFF(MINUTE, start_time, NOW()) 
       WHERE attempt_id = ?`,
      [attemptId]
    );

    // 2. Fetch details for suspicion check
    const [[attempt]] = await pool.query(
      `SELECT ea.*, e.duration_minutes 
       FROM Exam_Attempt ea 
       JOIN Exam e ON ea.exam_id = e.exam_id 
       WHERE ea.attempt_id = ?`,
      [attemptId]
    );

    // 3. Auto Detect Fast Submission
    if (attempt) {
      const duration = attempt.duration_minutes;
      const timeTaken = attempt.total_time_minutes;
      
      if (timeTaken < (duration * 0.2)) {
        await monitor.logViolation(attemptId, 'Very fast completion', 'Medium');
      }
    }

    return { success: true };
  } catch (err) {
    console.error('[SQL_ERROR] Failed to end exam:', err.message);
    throw err;
  }
};

/**
 * Log IP during exam and detect multi-device activity
 */
const logIpDuringExam = async (attemptId, ipAddress) => {
  try {
    await monitor.logIP(attemptId, ipAddress);

    const [[{ ip_count }]] = await pool.query(
      `SELECT COUNT(DISTINCT ip_address) as ip_count 
       FROM IP_Log 
       WHERE attempt_id = ?`,
      [attemptId]
    );

    let multipleIP = false;
    if (ip_count > 1) {
      multipleIP = true;
      const [[{ count: reportExists }]] = await pool.query(
        `SELECT COUNT(*) as count FROM Suspicion_Report 
         WHERE attempt_id = ? AND reason = ?`,
        [attemptId, 'Multiple IP detected']
      );

      if (reportExists === 0) {
        await monitor.logViolation(attemptId, 'Multiple IP detected', 'High');
      }
    }

    return { multipleIP, ip_count };
  } catch (err) {
    console.error('[SQL_ERROR] Failed to log real-time IP:', err.message);
    throw err;
  }
};

/**
 * Log a specific suspicion event (Tab Switch, Focus Loss) with escalation logic
 */
const logSuspicionEvent = async (attemptId, reason) => {
  try {
    // 1. Cooldown logic
    const [[lastReport]] = await pool.query(
      `SELECT reported_time FROM Suspicion_Report 
       WHERE attempt_id = ? AND reason = ? 
       ORDER BY reported_time DESC LIMIT 1`,
      [attemptId, reason]
    );

    if (lastReport) {
      const lastTime = new Date(lastReport.reported_time).getTime();
      const now = new Date().getTime();
      let cooldownMs = 5000;
      if (reason === "Idle inactivity") cooldownMs = 60000;
      else if (reason === "Network reconnected") cooldownMs = 10000;
      
      if (now - lastTime < cooldownMs) { 
        return { success: false, message: 'Cooldown active', cooldown: true };
      }
    }

    // 2. Count existing events to determine severity
    const [[{ count: eventCount }]] = await pool.query(
      `SELECT COUNT(*) as count FROM Suspicion_Report 
       WHERE attempt_id = ? AND reason = ?`,
      [attemptId, reason]
    );

    const newCount = eventCount + 1;
    let severity = 'Low';
    
    if (reason === 'Network reconnected') {
      if (newCount >= 4) severity = 'High';
      else if (newCount >= 2) severity = 'Medium';
    } else {
      if (newCount >= 5) severity = 'High';
      else if (newCount >= 3) severity = 'Medium';
    }

    // 3. Log via MonitoringService
    await monitor.logViolation(attemptId, reason, severity);

    return { 
      success: true, 
      count: newCount, 
      severity 
    };
  } catch (err) {
    console.error('[SQL_ERROR] Failed to log suspicion event:', err.message);
    throw err;
  }
};

module.exports = { startExam, endExam, logIpDuringExam, logSuspicionEvent };


