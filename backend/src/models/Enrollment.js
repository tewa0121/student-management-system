const { pool } = require('../config/db');

const Enrollment = {
  findAll: async (filters = {}) => {
    let query = 'SELECT e.*, s.firstName, s.lastName, s.studentId, a.name as academicYearName, c.name as className, sec.name as sectionName FROM enrollments e';
    query += ' JOIN students s ON e.studentId = s.id';
    query += ' JOIN academic_years a ON e.academicYearId = a.id';
    query += ' JOIN classes c ON e.classId = c.id';
    query += ' LEFT JOIN sections sec ON e.sectionId = sec.id';
    const params = [];
    const conditions = [];
    if (filters.academicYearId) { conditions.push('e.academicYearId = ?'); params.push(filters.academicYearId); }
    if (filters.classId) { conditions.push('e.classId = ?'); params.push(filters.classId); }
    if (filters.sectionId) { conditions.push('e.sectionId = ?'); params.push(filters.sectionId); }
    if (filters.studentId) { conditions.push('e.studentId = ?'); params.push(filters.studentId); }
    if (filters.status) { conditions.push('e.status = ?'); params.push(filters.status); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY e.id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM enrollments WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { studentId, academicYearId, classId, sectionId, enrollmentDate, status } = data;
    const [result] = await pool.query(
      'INSERT INTO enrollments (studentId, academicYearId, classId, sectionId, enrollmentDate, status) VALUES (?, ?, ?, ?, ?, ?)',
      [studentId, academicYearId, classId, sectionId || null, enrollmentDate, status || 'Active']
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    if (data.sectionId !== undefined) { fields.push('sectionId = ?'); values.push(data.sectionId || null); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    if (data.classId !== undefined) { fields.push('classId = ?'); values.push(data.classId); }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE enrollments SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM enrollments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Enrollment;