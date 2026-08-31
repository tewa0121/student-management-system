const { pool } = require('../config/db');

const AuditLog = {
  // Create a log entry
  create: async (data) => {
    const { userId, action, entity, entityId, oldValues, newValues, ipAddress, userAgent } = data;
    const [result] = await pool.query(
      `INSERT INTO audit_logs 
       (userId, action, entity, entityId, oldValues, newValues, ipAddress, userAgent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, action, entity, entityId, oldValues || null, newValues || null, ipAddress || null, userAgent || null]
    );
    return result.insertId;
  },

  // Get all logs with pagination and filters
  findAll: async (filters = {}) => {
    let query = `SELECT al.*, u.firstName, u.lastName, u.email 
                 FROM audit_logs al
                 LEFT JOIN users u ON al.userId = u.id
                 WHERE 1=1`;
    const params = [];
    if (filters.userId) {
      query += ' AND al.userId = ?';
      params.push(filters.userId);
    }
    if (filters.action) {
      query += ' AND al.action = ?';
      params.push(filters.action);
    }
    if (filters.entity) {
      query += ' AND al.entity = ?';
      params.push(filters.entity);
    }
    if (filters.startDate) {
      query += ' AND DATE(al.createdAt) >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND DATE(al.createdAt) <= ?';
      params.push(filters.endDate);
    }
    query += ' ORDER BY al.createdAt DESC LIMIT ? OFFSET ?';
    const limit = parseInt(filters.limit) || 50;
    const page = parseInt(filters.page) || 1;
    const offset = (page - 1) * limit;
    params.push(limit, offset);
    const [rows] = await pool.query(query, params);
    return rows;
  },

  // Count total logs (for pagination)
  count: async (filters = {}) => {
    let query = 'SELECT COUNT(*) as total FROM audit_logs WHERE 1=1';
    const params = [];
    if (filters.userId) {
      query += ' AND userId = ?';
      params.push(filters.userId);
    }
    if (filters.action) {
      query += ' AND action = ?';
      params.push(filters.action);
    }
    if (filters.entity) {
      query += ' AND entity = ?';
      params.push(filters.entity);
    }
    if (filters.startDate) {
      query += ' AND DATE(createdAt) >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND DATE(createdAt) <= ?';
      params.push(filters.endDate);
    }
    const [rows] = await pool.query(query, params);
    return rows[0].total;
  },

  // Get a single log entry
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM audit_logs WHERE id = ?', [id]);
    return rows[0];
  },
};

module.exports = AuditLog;