const { pool } = require('../config/db');

const Category = {
  findAll: async () => {
    const [rows] = await pool.query('SELECT * FROM library_categories ORDER BY name');
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM library_categories WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { name, description } = data;
    const [result] = await pool.query(
      'INSERT INTO library_categories (name, description) VALUES (?, ?)',
      [name, description || '']
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE library_categories SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM library_categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Category;