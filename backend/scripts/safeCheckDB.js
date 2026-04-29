const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function run() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log("STEP 1 — DB Connection");
    await conn.query("SELECT 1");
    console.log("DB Connected Successfully");

    console.log("\nSTEP 2 — Tables List");
    const [tables] = await conn.query("SHOW TABLES");
    console.table(tables);

    console.log("\nSTEP 3 — Question Table Check");
    try {
      const [desc] = await conn.query("DESCRIBE Question");
      console.table(desc);
    } catch(err) {
      console.log("Question table not found");
    }

    console.log("\nSTEP 4 — Option Table Check");
    try {
      const [desc] = await conn.query("DESCRIBE `Option` ");
      console.table(desc);
    } catch(err) {
      console.log("Option table not found");
    }

    console.log("\nSTEP 5 — Sample Questions");
    try {
      const [rows] = await conn.query("SELECT question_id, exam_id FROM Question LIMIT 5");
      console.table(rows);
    } catch(err) {
      console.log("No question rows found");
    }

    console.log("\nSTEP 6 — Sample Exams");
    try {
      const [rows] = await conn.query("SELECT exam_id, subject_name FROM Exam LIMIT 5");
      console.table(rows);
    } catch(err) {
      console.log("No exam rows found");
    }

    console.log("\nSTEP 7 — Sample Reports");
    try {
      const [rows] = await conn.query("SELECT attempt_id, severity FROM Suspicion_Report LIMIT 5");
      console.table(rows);
    } catch(err) {
      console.log("No reports found");
    }

    await conn.end();
    console.log("\nSAFE CHECK COMPLETED");
  } catch(err) {
    console.error("SAFE CHECK FAILED:", err.message);
  }
}

run();
