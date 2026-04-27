const { pool } = require('../config/db');

/**
 * Monitoring Service for centralized logging of all exam violations and events
 */
class MonitoringService {
  /**
   * Log a security or integrity violation
   * @param {number} attemptId 
   * @param {string} reason 
   * @param {string} severity 
   * @param {object} metadata - Optional additional details
   */
  async logViolation(attemptId, reason, severity, metadata = {}) {
    try {
      const metaJson = JSON.stringify(metadata);
      const [result] = await pool.query(
        `INSERT INTO Suspicion_Report (attempt_id, reason, severity, reported_time) 
         VALUES (?, ?, ?, NOW())`,
        [attemptId, reason, severity]
      );
      
      console.log(`[MONITORING] Violation Logged | Attempt: ${attemptId} | Reason: ${reason} | Severity: ${severity}`);
      return result.insertId;
    } catch (err) {
      console.error('[MONITORING_ERROR] Failed to log violation:', err.message);
      throw err;
    }
  }

  /**
   * Log an IP entry
   */
  async logIP(attemptId, ipAddress) {
    try {
      await pool.query(
        `INSERT INTO IP_Log (attempt_id, ip_address, log_time) 
         VALUES (?, ?, NOW())`,
        [attemptId, ipAddress]
      );
    } catch (err) {
      console.error('[MONITORING_ERROR] Failed to log IP:', err.message);
      throw err;
    }
  }
}

module.exports = new MonitoringService();
