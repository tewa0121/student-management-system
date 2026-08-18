const { pool } = require('../config/db');

const Timetable = {
  // Get timetable entries with joins
  findAll: async (filters = {}) => {
    let query = `SELECT t.*, c.name as className, sec.name as sectionName, 
                 s.name as subjectName, u.firstName as teacherFirstName, u.lastName as teacherLastName,
                 a.name as academicYearName, tm.name as termName
                 FROM timetable t
                 JOIN classes c ON t.classId = c.id
                 LEFT JOIN sections sec ON t.sectionId = sec.id
                 JOIN subjects s ON t.subjectId = s.id
                 JOIN users u ON t.teacherId = u.id
                 JOIN academic_years a ON t.academicYearId = a.id
                 LEFT JOIN terms tm ON t.termId = tm.id`;
    const params = [];
    const conditions = [];
    if (filters.classId) { conditions.push('t.classId = ?'); params.push(filters.classId); }
    if (filters.sectionId) { conditions.push('t.sectionId = ?'); params.push(filters.sectionId); }
    if (filters.academicYearId) { conditions.push('t.academicYearId = ?'); params.push(filters.academicYearId); }
    if (filters.termId) { conditions.push('t.termId = ?'); params.push(filters.termId); }
    if (filters.teacherId) { conditions.push('t.teacherId = ?'); params.push(filters.teacherId); }
    if (filters.dayOfWeek) { conditions.push('t.dayOfWeek = ?'); params.push(filters.dayOfWeek); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY t.dayOfWeek, t.startTime';
    const [rows] = await pool.query(query, params);
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM timetable WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { classId, sectionId, academicYearId, termId, dayOfWeek, startTime, endTime, subjectId, teacherId, room } = data;
    const [result] = await pool.query(
      `INSERT INTO timetable 
       (classId, sectionId, academicYearId, termId, dayOfWeek, startTime, endTime, subjectId, teacherId, room) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [classId, sectionId || null, academicYearId, termId || null, dayOfWeek, startTime, endTime, subjectId, teacherId, room || '']
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['classId', 'sectionId', 'academicYearId', 'termId', 'dayOfWeek', 'startTime', 'endTime', 'subjectId', 'teacherId', 'room'];
    for (const field of allowed) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE timetable SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM timetable WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
  // Conflict checks
  checkTeacherConflict: async (teacherId, dayOfWeek, startTime, endTime, excludeId = null) => {
    let query = `SELECT * FROM timetable WHERE teacherId = ? AND dayOfWeek = ? AND (
      (startTime < ? AND endTime > ?) OR
      (startTime < ? AND endTime > ?) OR
      (startTime >= ? AND startTime < ?) OR
      (endTime > ? AND endTime <= ?)
    )`;
    const params = [teacherId, dayOfWeek, endTime, startTime, startTime, endTime, startTime, endTime, startTime, endTime];
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    const [rows] = await pool.query(query, params);
    return rows;
  },
  checkRoomConflict: async (room, dayOfWeek, startTime, endTime, excludeId = null) => {
    if (!room) return [];
    let query = `SELECT * FROM timetable WHERE room = ? AND dayOfWeek = ? AND (
      (startTime < ? AND endTime > ?) OR
      (startTime < ? AND endTime > ?) OR
      (startTime >= ? AND startTime < ?) OR
      (endTime > ? AND endTime <= ?)
    )`;
    const params = [room, dayOfWeek, endTime, startTime, startTime, endTime, startTime, endTime, startTime, endTime];
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    const [rows] = await pool.query(query, params);
    return rows;
  },
};

module.exports = Timetable;