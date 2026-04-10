// routes/authRoutes.js
// All authentication-related routes.
// Prefix: /api  (mounted in server.js)

const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// POST /api/login
router.post('/login', login);

// Future auth routes:
// router.post('/logout', logout);
// router.post('/register', register);
// router.get('/me', verifyToken, getCurrentUser);

module.exports = router;
