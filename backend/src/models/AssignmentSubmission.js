const { pool } = require('../config/db');

const Submission = {
  findAll: async (filters = {}) => {
    let query = `SELECT s.*, a.title as assignmentTitle, u.firstName, u.lastName, u.studentId
                 FROM assignment_submissions s
                 JOIN assignments a ON s.assignmentId = a.id
                 JOIN students u ON s.studentId = u.id`;
    const params = [];
    const conditions = [];
    if (filters.assignmentId) { conditions.push('s.assignmentId = ?'); params.push(filters.assignmentId); }
    if (filters.studentId) { conditions.push('s.studentId = ?'); params.push(filters.studentId); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY s.submittedAt DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM assignment_submissions WHERE id = ?', [id]);
    return rows[0];
  },
  findOne: async (assignmentId, studentId) => {
    const [rows] = await pool.query('SELECT * FROM assignment_submissions WHERE assignmentId = ? AND studentId = ?', [assignmentId, studentId]);
    return rows[0];
  },
  create: async (data) => {
    const { assignmentId, studentId, submissionText, attachment } = data;
    const [result] = await pool.query(
      `INSERT INTO assignment_submissions (assignmentId, studentId, submissionText, attachment)
       VALUES (?, ?, ?, ?)`,
      [assignmentId, studentId, submissionText || '', attachment || null]
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['submissionText', 'attachment', 'grade', 'feedback'];
    for (const field of allowed) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE assignment_submissions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM assignment_submissions WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Submission;