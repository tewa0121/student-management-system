const { pool } = require('../config/db');

const Attendance = {
  // Get attendance records for a class on a specific date
  getByClassAndDate: async (classId, sectionId, date) => {
    let query = `SELECT a.*, s.firstName, s.lastName, s.studentId 
                 FROM attendance a 
                 JOIN students s ON a.studentId = s.id 
                 WHERE a.classId = ? AND a.date = ?`;
    const params = [classId, date];
    if (sectionId) {
      query += ' AND a.sectionId = ?';
      params.push(sectionId);
    }
    const [rows] = await pool.query(query, params);
    return rows;
  },

  // Get all students in a class (to display for marking attendance)
  getStudentsInClass: async (classId, sectionId = null) => {
    let query = 'SELECT id, studentId, firstName, lastName FROM students WHERE class = ?';
    const params = [classId];
    if (sectionId) {
      query += ' AND section = ?';
      params.push(sectionId);
    }
    const [rows] = await pool.query(query, params);
    return rows;
  },

  // Save or update attendance for multiple students
  saveMultiple: async (records) => {
    // records: array of { studentId, classId, sectionId, date, status, note }
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const rec of records) {
        const { studentId, classId, sectionId, date, status, note } = rec;
        await connection.query(
          `INSERT INTO attendance (studentId, classId, sectionId, date, status, note)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status), note = VALUES(note)`,
          [studentId, classId, sectionId || null, date, status, note || '']
        );
      }
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Get attendance report for a student over a period
  getStudentReport: async (studentId, startDate, endDate) => {
    const [rows] = await pool.query(
      `SELECT * FROM attendance WHERE studentId = ? AND date BETWEEN ? AND ? ORDER BY date`,
      [studentId, startDate, endDate]
    );
    return rows;
  },

  // Get attendance summary for a class on a date range
  getClassSummary: async (classId, sectionId, startDate, endDate) => {
    let query = `SELECT a.*, s.firstName, s.lastName, s.studentId 
                 FROM attendance a 
                 JOIN students s ON a.studentId = s.id 
                 WHERE a.classId = ? AND a.date BETWEEN ? AND ?`;
    const params = [classId, startDate, endDate];
    if (sectionId) {
      query += ' AND a.sectionId = ?';
      params.push(sectionId);
    }
    const [rows] = await pool.query(query, params);
    return rows;
  }
};

module.exports = Attendance;