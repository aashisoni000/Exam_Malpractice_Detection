// middleware/roleMiddleware.js
// Role-based access control (RBAC) middleware.
// Use as route guard to restrict access by role.
//
// Usage:
//   const { requireRole } = require('../middleware/roleMiddleware');
//   router.get('/admin/students', requireRole('admin'), studentsController.list);

/**
 * Middleware factory — restricts route to specific role(s).
 * @param {...string} allowedRoles - One or more roles that are permitted.
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // TODO: Replace with JWT verification when auth tokens are implemented.
    // Example:
    //   const token = req.headers.authorization?.split(' ')[1];
    //   const decoded = jwt.verify(token, config.jwtSecret);
    //   req.user = decoded;

    const user = req.user; // Will be set by auth middleware in the future

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in.',
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. This resource requires role: ${allowedRoles.join(' or ')}.`,
      });
    }

    next();
  };
};

/**
 * Convenience guards for common roles.
 */
const requireAdmin = requireRole('admin');
const requireStudent = requireRole('student');
const requireAny = requireRole('admin', 'student');

module.exports = { requireRole, requireAdmin, requireStudent, requireAny };
