// db/db.js
// MySQL connection pool using mysql2.
// Uses a pool (not a single connection) for scalability.
// When database auth is needed, this file requires no changes.

const mysql = require('mysql2');
const config = require('../config/env');

const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Promisified pool for async/await usage
const db = pool.promise();

// Test connection on startup (non-fatal if DB isn't ready yet in dev)
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('[DB] Database connection lost.');
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('[DB] Too many database connections.');
    } else if (err.code === 'ECONNREFUSED') {
      console.warn('[DB] Database connection refused. Running without DB (mock mode).');
    } else {
      console.error('[DB] Connection error:', err.message);
    }
    return;
  }
  if (connection) {
    connection.release();
    console.log('[DB] MySQL connected successfully.');
  }
});

module.exports = db;
