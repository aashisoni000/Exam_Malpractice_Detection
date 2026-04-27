require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../config/db');

async function run() {
  try {
    console.log("--------------------------------");
    console.log("STEP 1 — VERIFY DATABASE CONNECTION");
    console.log("--------------------------------");
    const [test] = await pool.query('SELECT 1 as result;');
    console.log(`SELECT 1; -> ${test[0].result === 1 ? 'OK' : 'FAIL'}`);
    
    console.log("\\n--------------------------------");
    console.log("STEP 2 — VERIFY EXISTING TABLE DATA");
    console.log("--------------------------------");
    const [[c1]] = await pool.query("SELECT COUNT(*) as c FROM Student");
    const [[c2]] = await pool.query("SELECT COUNT(*) as c FROM Exam");
    const [[c3]] = await pool.query("SELECT COUNT(*) as c FROM Exam_Attempt");
    const [[c4]] = await pool.query("SELECT COUNT(*) as c FROM Submission");
    const [[c5]] = await pool.query("SELECT COUNT(*) as c FROM IP_Log");
    const [[c6]] = await pool.query("SELECT COUNT(*) as c FROM Suspicion_Report");
    
    console.log(`Student -> ${c1.c}`);
    console.log(`Exam -> ${c2.c}`);
    console.log(`Exam_Attempt -> ${c3.c}`);
    console.log(`Submission -> ${c4.c}`);
    console.log(`IP_Log -> ${c5.c}`);
    console.log(`Suspicion_Report -> ${c6.c}`);

    console.log("\\n--------------------------------");
    console.log("STEP 4 — VERIFY SUSPICION DISTRIBUTION");
    console.log("--------------------------------");
    const [dist] = await pool.query("SELECT severity, COUNT(*) as cnt FROM Suspicion_Report GROUP BY severity");
    dist.forEach(row => {
      console.log(`${row.severity} -> ${row.cnt}`);
    });

    console.log("\\n--------------------------------");
    console.log("STEP 5 — VERIFY IP LOG BEHAVIOR");
    console.log("--------------------------------");
    const [ipLogs] = await pool.query("SELECT attempt_id, COUNT(*) as cnt FROM IP_Log GROUP BY attempt_id LIMIT 5");
    console.log("Sample of attempt_id IP counts:");
    ipLogs.forEach(row => {
        console.log(`Attempt ${row.attempt_id} -> ${row.cnt} IP(s)`);
    });

    console.log("\\n--------------------------------");
    console.log("STEP 6 — VERIFY SUBMISSION INTEGRITY");
    console.log("--------------------------------");
    const [[subInt]] = await pool.query(`
        SELECT COUNT(*) as c
        FROM Submission s
        LEFT JOIN Exam_Attempt ea
        ON s.attempt_id = ea.attempt_id
        WHERE ea.attempt_id IS NULL;
    `);
    console.log(`Submissions missing an attempt_id -> ${subInt.c} rows`);

    console.log("\\n--------------------------------");
    console.log("STEP 9 — FINAL VALIDATION QUERY");
    console.log("--------------------------------");
    const [[finalVal]] = await pool.query(`
        SELECT
        (SELECT COUNT(*) FROM Student) AS students,
        (SELECT COUNT(*) FROM Exam) AS exams,
        (SELECT COUNT(*) FROM Exam_Attempt) AS attempts,
        (SELECT COUNT(*) FROM Submission) AS submissions,
        (SELECT COUNT(*) FROM IP_Log) AS ip_logs,
        (SELECT COUNT(*) FROM Suspicion_Report) AS reports;
    `);
    console.log(`students -> ${finalVal.students}`);
    console.log(`exams -> ${finalVal.exams}`);
    console.log(`attempts -> ${finalVal.attempts}`);
    console.log(`submissions -> ${finalVal.submissions}`);
    console.log(`ip_logs -> ${finalVal.ip_logs}`);
    console.log(`reports -> ${finalVal.reports}`);

  } catch (err) {
    console.error("Database validation error:", err);
  } finally {
    pool.end();
  }
}
run();
