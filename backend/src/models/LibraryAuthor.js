const { pool } = require('../config/db');

const Author = {
  findAll: async () => {
    const [rows] = await pool.query('SELECT * FROM library_authors ORDER BY name');
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM library_authors WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { name, biography } = data;
    const [result] = await pool.query(
      'INSERT INTO library_authors (name, biography) VALUES (?, ?)',
      [name, biography || '']
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.biography !== undefined) { fields.push('biography = ?'); values.push(data.biography); }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE library_authors SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM library_authors WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Author;