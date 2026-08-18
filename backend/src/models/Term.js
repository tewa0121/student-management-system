const { pool } = require('../config/db');

const Term = {
  findAll: async (academicYearId = null) => {
    let query = 'SELECT * FROM terms';
    const params = [];
    if (academicYearId) {
      query += ' WHERE academicYearId = ?';
      params.push(academicYearId);
    }
    query += ' ORDER BY id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM terms WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { academicYearId, name, startDate, endDate, isActive } = data;
    const [result] = await pool.query(
      'INSERT INTO terms (academicYearId, name, startDate, endDate, isActive) VALUES (?, ?, ?, ?, ?)',
      [academicYearId, name, startDate, endDate, isActive || false]
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
    if (data.academicYearId !== undefined) { fields.push('academicYearId = ?'); values.push(data.academicYearId); }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE terms SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM terms WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
  setActive: async (id, academicYearId) => {
    // Deactivate all terms in the same academic year, then activate this one
    await pool.query('UPDATE terms SET isActive = FALSE WHERE academicYearId = ?', [academicYearId]);
    await pool.query('UPDATE terms SET isActive = TRUE WHERE id = ?', [id]);
  }
};

module.exports = Term;