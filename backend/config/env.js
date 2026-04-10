// config/env.js
// Centralizes environment variable validation and access.
// Import this file wherever config values are needed.

require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'exam_malpractice_db',
  },

  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_change_me',
};

// Validate required vars in production
if (config.nodeEnv === 'production') {
  const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
  required.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
}

module.exports = config;
