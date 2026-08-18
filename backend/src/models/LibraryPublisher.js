const { pool } = require('../config/db');

const Publisher = {
  findAll: async () => {
    const [rows] = await pool.query('SELECT * FROM library_publishers ORDER BY name');
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM library_publishers WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { name, address, phone, email } = data;
    const [result] = await pool.query(
      'INSERT INTO library_publishers (name, address, phone, email) VALUES (?, ?, ?, ?)',
      [name, address || '', phone || '', email || '']
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.address !== undefined) { fields.push('address = ?'); values.push(data.address); }
    if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
    if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE library_publishers SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM library_publishers WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Publisher;