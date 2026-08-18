const { pool } = require('../config/db');

const Exam = {
  findAll: async (filters = {}) => {
    let query = 'SELECT e.*, c.name as className, s.name as subjectName, t.name as examTypeName FROM exams e';
    query += ' JOIN classes c ON e.classId = c.id';
    query += ' JOIN subjects s ON e.subjectId = s.id';
    query += ' JOIN exam_types t ON e.examTypeId = t.id';
    const params = [];
    const conditions = [];
    if (filters.classId) { conditions.push('e.classId = ?'); params.push(filters.classId); }
    if (filters.subjectId) { conditions.push('e.subjectId = ?'); params.push(filters.subjectId); }
    if (filters.examTypeId) { conditions.push('e.examTypeId = ?'); params.push(filters.examTypeId); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY e.date DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM exams WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { examTypeId, classId, subjectId, name, date, maxMarks, passingMarks, description } = data;
    const [result] = await pool.query(
      `INSERT INTO exams (examTypeId, classId, subjectId, name, date, maxMarks, passingMarks, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [examTypeId, classId, subjectId, name, date, maxMarks || 100, passingMarks || 40, description || '']
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['examTypeId', 'classId', 'subjectId', 'name', 'date', 'maxMarks', 'passingMarks', 'description'];
    for (const field of allowed) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE exams SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM exams WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Exam;