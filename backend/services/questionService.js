const { pool } = require('../config/db');

const getQuestionsByExam = async (exam_id) => {
  const [rows] = await pool.query(
    'SELECT * FROM Question WHERE exam_id = ? ORDER BY question_id',
    [exam_id]
  );
  return rows;
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
