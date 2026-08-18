const { pool } = require('../config/db');

const SchoolClass = {
  findAll: async () => {
    const [rows] = await pool.query('SELECT * FROM classes ORDER BY id DESC');
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM classes WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { name, description, capacity } = data;
    const [result] = await pool.query(
      'INSERT INTO classes (name, description, capacity) VALUES (?, ?, ?)',
      [name, description || '', capacity || 0]
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.capacity !== undefined) { fields.push('capacity = ?'); values.push(data.capacity); }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE classes SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM classes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = SchoolClass;