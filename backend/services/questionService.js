const { pool } = require('../config/db');

const getQuestionsByExam = async (exam_id) => {
  console.log(`[SERVICE] Fetching questions for exam: ${exam_id}`);
  console.time("QuestionFetch");
  
  const [rows] = await pool.query(
    `SELECT 
      q.question_id,
      q.question_text,
      q.question_type,
      q.marks,
      o.option_id,
      o.option_text,
      o.is_correct
    FROM Question q
    LEFT JOIN \`Option\` o ON q.question_id = o.question_id
    WHERE q.exam_id = ?
    ORDER BY q.question_id`,
    [exam_id]
  );
  
  console.timeEnd("QuestionFetch");

  // Group options under each question
  const questionsMap = new Map();
  
  for (const row of rows) {
    if (!questionsMap.has(row.question_id)) {
      questionsMap.set(row.question_id, {
        question_id: row.question_id,
        question_text: row.question_text,
        question_type: row.question_type,
        marks: row.marks,
        options: []
      });
    }
    
    if (row.option_id) {
      questionsMap.get(row.question_id).options.push({
        option_id: row.option_id,
        option_text: row.option_text,
        is_correct: row.is_correct === 1
      });
    }
  }
  
  const questions = Array.from(questionsMap.values());
  console.log(`[SERVICE] Loaded ${questions.length} questions with options`);
  return questions;
};

const createQuestion = async ({ exam_id, question_text, question_type = 'mcq', marks = 1 }) => {
  const [result] = await pool.query(
    'INSERT INTO Question (exam_id, question_text, question_type, marks) VALUES (?, ?, ?, ?)',
    [exam_id, question_text, question_type, marks]
  );
  return { question_id: result.insertId, exam_id, question_text, question_type, marks };
};

const getOptionsByQuestion = async (question_id) => {
  const [rows] = await pool.query(
    'SELECT * FROM `Option` WHERE question_id = ? ORDER BY option_id',
    [question_id]
  );
  return rows;
};

const createOption = async ({ question_id, option_text, is_correct = false }) => {
  const [result] = await pool.query(
    'INSERT INTO `Option` (question_id, option_text, is_correct) VALUES (?, ?, ?)',
    [question_id, option_text, is_correct]
  );
  return { option_id: result.insertId, question_id, option_text, is_correct };
};

module.exports = { getQuestionsByExam, createQuestion, getOptionsByQuestion, createOption };
