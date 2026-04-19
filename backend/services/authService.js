const jwt = require('jsonwebtoken');
const env = require('../config/env');
const students = require('../mockData/students.json');

const login = async (email, password, role) => {
  // Mock logic
  if (role === 'admin' && email === 'admin@exam.com' && password === 'admin123') {
    const token = jwt.sign({ id: 999, role: 'admin' }, env.JWT_SECRET, { expiresIn: '1d' });
    return { user: { id: 999, name: 'Admin', email }, token, role: 'admin' };
  }

  if (role === 'student') {
    const student = students.find(s => s.email === email);
    if (!student && email === 'student@exam.com' && password === 'student123') {
       // fallback mock
       const token = jwt.sign({ id: 1, role: 'student' }, env.JWT_SECRET, { expiresIn: '1d' });
       return { user: { id: 1, name: 'Mock Student', email }, token, role: 'student' };
    }
    if (student) {
      // Ignore password check for mock
      const token = jwt.sign({ id: student.student_id, role: 'student' }, env.JWT_SECRET, { expiresIn: '1d' });
      return { user: { id: student.student_id, name: student.student_name, email: student.email }, token, role: 'student' };
    }
  }

  throw new Error('Invalid credentials');
};

module.exports = { login };
