const { pool } = require('../config/db');

const getAllStudents = async () => {
  const [rows] = await pool.query('SELECT * FROM Student');
  return rows;
};

module.exports = { getAllStudents };
