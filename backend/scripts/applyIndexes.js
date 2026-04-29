require('dotenv').config();
const { pool } = require('../config/db');

async function run() {
  try {
    console.log("Applying indexes for Question and Option tables...");
    
    // Check if indexes exist first (optional but safer)
    try {
      await pool.query('CREATE INDEX idx_question_exam ON Question(exam_id)');
      console.log('✅ Index created on Question(exam_id)');
    } catch(err) {
      if (err.code === 'ER_DUP_KEYNAME') console.log('ℹ️ Index idx_question_exam already exists');
      else throw err;
    }

    try {
      await pool.query('CREATE INDEX idx_option_question ON `Option`(question_id)');
      console.log('✅ Index created on Option(question_id)');
    } catch(err) {
      if (err.code === 'ER_DUP_KEYNAME') console.log('ℹ️ Index idx_option_question already exists');
      else throw err;
    }

    console.log("Database optimization complete.");
  } catch(err) {
    console.error('❌ Failed to apply indexes:', err.message);
  } finally {
    pool.end();
  }
}

run();
