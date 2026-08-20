// const { pool } = require('../config/db');

// const Attendance = {
//   getByClassAndDate: async (classId, sectionId, date) => {
//     let query = `SELECT a.*, s.firstName, s.lastName, s.studentId 
//                  FROM attendance a 
//                  JOIN students s ON a.studentId = s.id 
//                  WHERE a.classId = ? AND a.date = ?`;
//     const params = [classId, date];
//     if (sectionId) {
//       query += ' AND a.sectionId = ?';
//       params.push(sectionId);
//     }
//     const [rows] = await pool.query(query, params);
//     return rows;
//   },

//   // ✅ FIXED: Uses class & section names from the students table
//   getStudentsInClass: async (classId, sectionId = null) => {
//     // 1. Get class name
//     const [classRows] = await pool.query('SELECT name FROM classes WHERE id = ?', [classId]);
//     if (classRows.length === 0) {
//       return [];
//     }
//     const className = classRows[0].name;

//     // 2. Get section name (if provided)
//     let sectionName = null;
//     if (sectionId) {
//       const [sectionRows] = await pool.query('SELECT name FROM sections WHERE id = ?', [sectionId]);
//       if (sectionRows.length > 0) {
//         sectionName = sectionRows[0].name;
//       }
//     }

//     // 3. Query students by class and section
//     let query = 'SELECT id, studentId, firstName, lastName FROM students WHERE class = ?';
//     const params = [className];
//     if (sectionName) {
//       query += ' AND section = ?';
//       params.push(sectionName);
//     }
//     const [rows] = await pool.query(query, params);
//     return rows;
//   },

//   saveMultiple: async (records) => {
//     const connection = await pool.getConnection();
//     try {
//       await connection.beginTransaction();
//       for (const rec of records) {
//         const { studentId, classId, sectionId, date, status, note } = rec;
//         await connection.query(
//           `INSERT INTO attendance (studentId, classId, sectionId, date, status, note)
//            VALUES (?, ?, ?, ?, ?, ?)
//            ON DUPLICATE KEY UPDATE status = VALUES(status), note = VALUES(note)`,
//           [studentId, classId, sectionId || null, date, status, note || '']
//         );
//       }
//       await connection.commit();
//       return true;
//     } catch (error) {
//       await connection.rollback();
//       throw error;
//     } finally {
//       connection.release();
//     }
//   },

//   getStudentReport: async (studentId, startDate, endDate) => {
//     const [rows] = await pool.query(
//       `SELECT * FROM attendance WHERE studentId = ? AND date BETWEEN ? AND ? ORDER BY date`,
//       [studentId, startDate, endDate]
//     );
//     return rows;
//   },

//   getClassSummary: async (classId, sectionId, startDate, endDate) => {
//     let query = `SELECT a.*, s.firstName, s.lastName, s.studentId 
//                  FROM attendance a 
//                  JOIN students s ON a.studentId = s.id 
//                  WHERE a.classId = ? AND a.date BETWEEN ? AND ?`;
//     const params = [classId, startDate, endDate];
//     if (sectionId) {
//       query += ' AND a.sectionId = ?';
//       params.push(sectionId);
//     }
//     const [rows] = await pool.query(query, params);
//     return rows;
//   }
// };

// module.exports = Attendance;