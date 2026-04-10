// controllers/authController.js
// Handles authentication logic.
// Currently uses mock (hardcoded) users.
// TODO: Replace mock users with DB queries from db/db.js when ready.

// ─── Mock Users ────────────────────────────────────────────────────────────────
// Replace this block with DB lookup when database auth is implemented.
const MOCK_USERS = [
  {
    id: 1,
    email: 'student@exam.com',
    password: 'student123',
    role: 'student',
    name: 'John Doe',
  },
  {
    id: 2,
    email: 'admin@exam.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
  },
];
// ───────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/login
 * Body: { email, password, role }
 * Returns: { success, message, user, redirectTo }
 */
const login = (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Basic validation
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and role are required.',
      });
    }

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "student" or "admin".',
      });
    }

    // ── Mock Authentication ──────────────────────────────────────────────────
    // TODO: Replace with DB query:
    //   const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);
    //   const user = rows[0];
    //   if (!user) return res.status(401).json({ success: false, message: '...' });
    //   const isMatch = await bcrypt.compare(password, user.password_hash);
    // ────────────────────────────────────────────────────────────────────────
    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password && u.role === role
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or role mismatch.',
      });
    }

    // Determine redirect based on role
    const redirectTo =
      role === 'admin' ? '/admin-dashboard' : '/student-dashboard';

    // Return safe user object (never return password)
    const { password: _pw, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: `Login successful. Welcome, ${safeUser.name}!`,
      user: safeUser,
      redirectTo,
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

module.exports = { login };
