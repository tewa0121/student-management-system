const { verifyToken } = require('../utils/jwt');
const { pool } = require('../config/db');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check a specific permission
const authorize = (permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      // Get user's role
      const [userRows] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
      if (userRows.length === 0) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const roleName = userRows[0].role;

      // If super_admin, allow everything
      if (roleName === 'super_admin') {
        return next();
      }

      // Check if the role has the required permission
      const [permRows] = await pool.query(
        `SELECT p.name FROM permissions p
         JOIN role_permissions rp ON rp.permissionId = p.id
         JOIN roles r ON r.id = rp.roleId
         WHERE r.name = ? AND p.name = ?`,
        [roleName, permission]
      );

      if (permRows.length === 0) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
};

module.exports = { authenticate, authorize };