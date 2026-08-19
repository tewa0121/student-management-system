const { pool } = require('../config/db');

const ExamResult = {
  getByExamId: async (examId) => {
    const [rows] = await pool.query(
      `SELECT er.*, s.firstName, s.lastName, s.studentId, s.class, s.section
       FROM exam_results er
       JOIN students s ON er.studentId = s.id
       WHERE er.examId = ?
       ORDER BY s.studentId`,
      [examId]
    );
    return rows;
  },
  getByExamAndStudent: async (examId, studentId) => {
    const [rows] = await pool.query(
      'SELECT * FROM exam_results WHERE examId = ? AND studentId = ?',
      [examId, studentId]
    );
    return rows[0];
  },
  bulkUpsert: async (examId, results) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const r of results) {
        const { studentId, marksObtained, grade, gpa, remarks } = r;
        await connection.query(
          `INSERT INTO exam_results (examId, studentId, marksObtained, grade, gpa, remarks)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           marksObtained = VALUES(marksObtained),
           grade = VALUES(grade),
           gpa = VALUES(gpa),
           remarks = VALUES(remarks)`,
          [examId, studentId, marksObtained, grade, gpa, remarks]
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
};

module.exports = ExamResult;