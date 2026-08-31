const AuditLog = require('../models/AuditLog');

// Helper to get client IP address
const getClientIp = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || null;
  return ip;
};

const getAuditLogs = async (req, res, next) => {
  try {
    const { userId, action, entity, startDate, endDate, page = 1, limit = 50 } = req.query;
    const filters = { userId, action, entity, startDate, endDate, page, limit };
    const logs = await AuditLog.findAll(filters);
    const total = await AuditLog.count(filters);
    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAuditLog = async (req, res, next) => {
  try {
    const log = await AuditLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log entry not found' });
    res.json(log);
  } catch (error) {
    next(error);
  }
};

// Utility function to log actions (used by other controllers)
// Parameters:
// - req: express request object (optional – if not provided, ipAddress and userAgent will be null)
// - userId: ID of the user performing the action
// - action: string (e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')
// - entity: string (e.g., 'student', 'user', 'invoice')
// - entityId: ID of the affected record
// - oldValues: object (previous values) – will be JSON stringified
// - newValues: object (new values) – will be JSON stringified
const logAction = async (req, userId, action, entity, entityId, oldValues = null, newValues = null) => {
  try {
    // Extract IP and user agent from request (if provided)
    let ipAddress = null;
    let userAgent = null;
    if (req) {
      ipAddress = getClientIp(req);
      userAgent = req.headers['user-agent'] || null;
    }

    await AuditLog.create({
      userId,
      action,
      entity,
      entityId,
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

module.exports = { getAuditLogs, getAuditLog, logAction };