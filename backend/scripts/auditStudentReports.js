require("dotenv").config();
const { pool } = require("../config/db");

async function run() {
  try {
    console.log("Checking student reports...");
    const [rows] = await pool.query(`
      SELECT
        ea.student_id,
        COUNT(sr.report_id) AS report_count
      FROM Suspicion_Report sr
      JOIN Exam_Attempt ea
      ON sr.attempt_id = ea.attempt_id
      GROUP BY ea.student_id
      ORDER BY report_count DESC
      LIMIT 10
    `);
    console.table(rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
