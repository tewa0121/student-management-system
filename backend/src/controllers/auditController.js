const AuditLog = require('../models/AuditLog');

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
const logAction = async (req, userId, action, entity, entityId, oldValues = null, newValues = null) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || null;
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