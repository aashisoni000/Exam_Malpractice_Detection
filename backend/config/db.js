const mysql = require('mysql2/promise');

// Build connection config from env vars
// If DB_SOCKET is set, use Unix socket (for auth_socket root on Ubuntu/Debian)
const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'OnlineExamDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

if (process.env.DB_SOCKET) {
  connectionConfig.socketPath = process.env.DB_SOCKET;
  delete connectionConfig.host;
}

const pool = mysql.createPool(connectionConfig);

const connectDB = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('MySQL Connected Successfully');
    conn.release();
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
    console.error('Check your .env: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
