const { pool } = require('../config/db');

const Subject = {
  findAll: async (classId = null) => {
    let query = 'SELECT * FROM subjects';
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
    const [rows] = await pool.query('SELECT * FROM subjects WHERE id = ?', [id]);
    return rows[0];
  },
  findByCode: async (code) => {
    const [rows] = await pool.query('SELECT * FROM subjects WHERE code = ?', [code]);
    return rows[0];
  },
  create: async (data) => {
    const { code, name, description, classId, creditHours, maxMarks, passingMarks, isElective } = data;
    const [result] = await pool.query(
      `INSERT INTO subjects 
       (code, name, description, classId, creditHours, maxMarks, passingMarks, isElective) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, name, description || '', classId || null, creditHours || 0, maxMarks || 100, passingMarks || 40, isElective || false]
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['code', 'name', 'description', 'classId', 'creditHours', 'maxMarks', 'passingMarks', 'isElective'];
    for (const field of allowed) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE subjects SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM subjects WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Subject;