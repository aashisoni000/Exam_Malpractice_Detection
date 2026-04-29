require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../config/db');

async function seed() {
  try {
    const [exams] = await pool.query('SELECT exam_id FROM Exam');
    console.log(`Found ${exams.length} exams. Adding written questions...`);

    const writtenQuestions = [
      { text: "Explain the ACID properties in database management systems.", marks: 5 },
      { text: "Describe the concept of deadlock and mention one method for deadlock prevention.", marks: 5 },
      { text: "What is the difference between supervised and unsupervised learning?", marks: 5 },
      { text: "Explain the importance of normalization in database design.", marks: 5 }
    ];

    for (const exam of exams) {
      // Pick 2 random questions for each exam
      const shuffled = [...writtenQuestions].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 2);

      for (const q of selected) {
        await pool.query(
          'INSERT INTO Question (exam_id, question_text, question_type, marks) VALUES (?, ?, ?, ?)',
          [exam.exam_id, q.text, 'written', q.marks]
        );
      }
      console.log(`Added 2 written questions to Exam ID: ${exam.exam_id}`);
    }

    console.log("Seeding completed successfully.");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    pool.end();
    process.exit();
  }
}

seed();
