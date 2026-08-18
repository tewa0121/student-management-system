const { pool } = require('../config/db');

const Section = {
  findAll: async (classId = null) => {
    let query = 'SELECT * FROM sections';
    const params = [];
    if (classId) {
      query += ' WHERE classId = ?';
      params.push(classId);
    }
    query += ' ORDER BY id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM sections WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { classId, name, teacherId, capacity } = data;
    const [result] = await pool.query(
      'INSERT INTO sections (classId, name, teacherId, capacity) VALUES (?, ?, ?, ?)',
      [classId, name, teacherId || null, capacity || 0]
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.classId !== undefined) { fields.push('classId = ?'); values.push(data.classId); }
    if (data.teacherId !== undefined) { fields.push('teacherId = ?'); values.push(data.teacherId); }
    if (data.capacity !== undefined) { fields.push('capacity = ?'); values.push(data.capacity); }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE sections SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM sections WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Section;