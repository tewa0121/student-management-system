const { pool } = require('../config/db');

const Assignment = {
  findAll: async (filters = {}) => {
    let query = `SELECT a.*, c.name as className, s.name as subjectName, u.firstName as teacherFirstName, u.lastName as teacherLastName
                 FROM assignments a
                 JOIN classes c ON a.classId = c.id
                 JOIN subjects s ON a.subjectId = s.id
                 JOIN users u ON a.teacherId = u.id`;
    const params = [];
    const conditions = [];
    if (filters.classId) { conditions.push('a.classId = ?'); params.push(filters.classId); }
    if (filters.subjectId) { conditions.push('a.subjectId = ?'); params.push(filters.subjectId); }
    if (filters.teacherId) { conditions.push('a.teacherId = ?'); params.push(filters.teacherId); }
    if (filters.status) { conditions.push('a.status = ?'); params.push(filters.status); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY a.deadline ASC';
    const [rows] = await pool.query(query, params);
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM assignments WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { classId, subjectId, teacherId, title, description, deadline, maxScore, attachments, status } = data;
    const [result] = await pool.query(
      `INSERT INTO assignments (classId, subjectId, teacherId, title, description, deadline, maxScore, attachments, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [classId, subjectId, teacherId, title, description, deadline, maxScore || 100, attachments || null, status || 'draft']
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['classId', 'subjectId', 'teacherId', 'title', 'description', 'deadline', 'maxScore', 'attachments', 'status'];
    for (const field of allowed) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE assignments SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM assignments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Assignment;