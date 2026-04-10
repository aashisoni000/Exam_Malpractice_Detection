// server.js
// Entry point for the Express API server.
// Loads config, connects middleware, mounts routes, and starts listening.

const express = require('express');
const cors = require('cors');
const config = require('./config/env');

// ── Route Imports ─────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const examRoutes = require('./routes/examRoutes');
// Future routes (add here as features are built):
// const studentRoutes = require('./routes/studentRoutes');
// const reportRoutes  = require('./routes/reportRoutes');
// const ipLogRoutes   = require('./routes/ipLogRoutes');
// ──────────────────────────────────────────────────────────────────────────────

const app = express();

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(
  cors({
    origin: 'http://localhost:5173', // Vite dev server default port
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
// ──────────────────────────────────────────────────────────────────────────────

// ── Route Mounting ────────────────────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api/exams', examRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api/reports',  reportRoutes);
// app.use('/api/ip-logs',  ipLogRoutes);
// ──────────────────────────────────────────────────────────────────────────────

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Exam Malpractice Detection API is running.',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  });
});
// ──────────────────────────────────────────────────────────────────────────────

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});
// ──────────────────────────────────────────────────────────────────────────────

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Server] Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error.',
    ...(config.nodeEnv === 'development' && { error: err.message }),
  });
});
// ──────────────────────────────────────────────────────────────────────────────

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`\n🚀 Server running on http://localhost:${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`✅ Health check: http://localhost:${config.port}/api/health\n`);
});

module.exports = app;
