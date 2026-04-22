const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { pool } = require('../config/db');

const login = async (email, password, role) => {
  // Admin: hardcoded credentials (no admin table in schema)
  if (role === 'admin' && email === 'admin@exam.com' && password === 'admin123') {
    const token = jwt.sign({ id: 999, role: 'admin' }, env.JWT_SECRET, { expiresIn: '1d' });
    return { user: { id: 999, name: 'Admin', email }, token, role: 'admin' };
  }

  // Student: query from MySQL Student table
  if (role === 'student') {
    const [rows] = await pool.query(
      'SELECT * FROM Student WHERE registration_number = ?',
      [email] // username field acts as registration_number
    );

    if (rows.length === 0) {
      throw new Error('Invalid registration number');
    }

    const student = rows[0];

    const token = jwt.sign({ id: student.student_id, role: 'student' }, env.JWT_SECRET, { expiresIn: '1d' });
    return {
      user: { id: student.student_id, name: student.name, email: student.registration_number },
      token,
      role: 'student',
    };
  }

  throw new Error('Invalid credentials');
};

module.exports = { login };
