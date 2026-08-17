const { pool } = require('../config/db');

const AcademicYear = {
  findAll: async () => {
    const [rows] = await pool.query('SELECT * FROM academic_years ORDER BY id DESC');
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM academic_years WHERE id = ?', [id]);
    return rows[0];
  },
  findActive: async () => {
    const [rows] = await pool.query('SELECT * FROM academic_years WHERE isActive = TRUE');
    return rows[0];
  },
  create: async (data) => {
    const { name, startDate, endDate, isActive } = data;
    const [result] = await pool.query(
      'INSERT INTO academic_years (name, startDate, endDate, isActive) VALUES (?, ?, ?, ?)',
      [name, startDate, endDate, isActive || false]
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.startDate !== undefined) { fields.push('startDate = ?'); values.push(data.startDate); }
    if (data.endDate !== undefined) { fields.push('endDate = ?'); values.push(data.endDate); }
    if (data.isActive !== undefined) { fields.push('isActive = ?'); values.push(data.isActive); }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE academic_years SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM academic_years WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
  setActive: async (id) => {
    // Deactivate all others first
    await pool.query('UPDATE academic_years SET isActive = FALSE');
    await pool.query('UPDATE academic_years SET isActive = TRUE WHERE id = ?', [id]);
  }
};

module.exports = AcademicYear;