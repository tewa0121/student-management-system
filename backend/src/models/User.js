const { pool } = require('../config/db');

const User = {
  findByEmail: async (email) => {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      console.error('findByEmail error:', error);
      throw error;
    }
  },
  findById: async (id) => {
    try {
      const [rows] = await pool.query('SELECT id, email, firstName, lastName, role, isActive, createdAt FROM users WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('findById error:', error);
      throw error;
    }
  },
  create: async (userData) => {
    const { email, password, firstName, lastName, role } = userData;
    try {
      const [result] = await pool.query(
        'INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)',
        [email, password, firstName, lastName, role || 'student']
      );
      return result.insertId;
    } catch (error) {
      console.error('create user error:', error);
      throw error;
    }
  },
  // ... other methods
};

module.exports = User;