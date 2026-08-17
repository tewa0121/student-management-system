const { pool } = require('../config/db');

const User = {
  findByEmail: async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await pool.query('SELECT id, email, firstName, lastName, role, isActive, createdAt FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  findAll: async (page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;
    let query = 'SELECT id, email, firstName, lastName, role, isActive, createdAt FROM users';
    const params = [];
    if (search) {
      query += ' WHERE email LIKE ? OR firstName LIKE ? OR lastName LIKE ?';
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const [rows] = await pool.query(query, params);
    return rows;
  },

  countAll: async (search = '') => {
    let query = 'SELECT COUNT(*) as total FROM users';
    const params = [];
    if (search) {
      query += ' WHERE email LIKE ? OR firstName LIKE ? OR lastName LIKE ?';
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    const [rows] = await pool.query(query, params);
    return rows[0].total;
  },

  create: async (userData) => {
    const { email, password, firstName, lastName, role } = userData;
    const [result] = await pool.query(
      'INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)',
      [email, password, firstName, lastName, role || 'student']
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    if (data.firstName !== undefined) { fields.push('firstName = ?'); values.push(data.firstName); }
    if (data.lastName !== undefined) { fields.push('lastName = ?'); values.push(data.lastName); }
    if (data.role !== undefined) { fields.push('role = ?'); values.push(data.role); }
    if (data.isActive !== undefined) { fields.push('isActive = ?'); values.push(data.isActive); }
    if (data.password) {
      const bcrypt = require('bcryptjs');
      const hashed = await bcrypt.hash(data.password, 10);
      fields.push('password = ?');
      values.push(hashed);
    }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  getRoles: async () => {
    const [rows] = await pool.query('SELECT id, name, description FROM roles ORDER BY name');
    return rows;
  },

  getPermissions: async () => {
    const [rows] = await pool.query('SELECT id, name, description FROM permissions ORDER BY name');
    return rows;
  },

  getRolePermissions: async (roleId) => {
    const [rows] = await pool.query(
      `SELECT p.id, p.name FROM permissions p
       JOIN role_permissions rp ON rp.permissionId = p.id
       WHERE rp.roleId = ?`,
      [roleId]
    );
    return rows;
  },

  assignPermissionToRole: async (roleId, permissionId) => {
    await pool.query(
      'INSERT IGNORE INTO role_permissions (roleId, permissionId) VALUES (?, ?)',
      [roleId, permissionId]
    );
  },

  removePermissionFromRole: async (roleId, permissionId) => {
    await pool.query(
      'DELETE FROM role_permissions WHERE roleId = ? AND permissionId = ?',
      [roleId, permissionId]
    );
  },
};

module.exports = User;