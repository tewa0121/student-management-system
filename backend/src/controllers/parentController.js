const { pool } = require('../config/db');

// Get parent record by user ID
const getParentByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT * FROM parents WHERE userId = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Parent record not found for this user' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// Get all children (students) linked to this parent
const getChildren = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Get parent id from user id
    const [parentRows] = await pool.query('SELECT id FROM parents WHERE userId = ?', [userId]);
    if (parentRows.length === 0) {
      return res.status(404).json({ message: 'Parent record not found' });
    }
    const parentId = parentRows[0].id;
    // Get students linked via student_parents
    const [students] = await pool.query(
      `SELECT s.* FROM students s
       JOIN student_parents sp ON s.id = sp.studentId
       WHERE sp.parentId = ?`,
      [parentId]
    );
    res.json(students);
  } catch (error) {
    next(error);
  }
};

// Get a specific child's full data (for dashboard)
const getChildDashboard = async (req, res, next) => {
  try {
    const childId = req.params.childId;
    // We should verify that this child belongs to the parent
    const userId = req.user.id;
    const [parentRows] = await pool.query('SELECT id FROM parents WHERE userId = ?', [userId]);
    if (parentRows.length === 0) {
      return res.status(404).json({ message: 'Parent record not found' });
    }
    const parentId = parentRows[0].id;
    // Check link
    const [link] = await pool.query(
      'SELECT * FROM student_parents WHERE parentId = ? AND studentId = ?',
      [parentId, childId]
    );
    if (link.length === 0) {
      return res.status(403).json({ message: 'You are not authorized to view this child' });
    }

    // Get student details
    const [studentRows] = await pool.query('SELECT * FROM students WHERE id = ?', [childId]);
    if (studentRows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const student = studentRows[0];

    // Get attendance summary (for example, current year)
    const [attendance] = await pool.query(
      `SELECT
         SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
         SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent,
         COUNT(*) as total
       FROM attendance WHERE studentId = ? AND date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)`,
      [childId]
    );
    // Get grades (exam results)
    const [grades] = await pool.query(
      `SELECT er.*, e.name as examName, e.maxMarks, s.name as subjectName
       FROM exam_results er
       JOIN exams e ON er.examId = e.id
       JOIN subjects s ON e.subjectId = s.id
       WHERE er.studentId = ?
       ORDER BY e.date DESC`,
      [childId]
    );
    // Get fee summary
    const [feeSummary] = await pool.query(
      `SELECT SUM(totalAmount) as total, SUM(balance) as balance FROM invoices WHERE studentId = ?`,
      [childId]
    );
    // Get upcoming exams (for this student's class)
    const [upcomingExams] = await pool.query(
      `SELECT e.*, s.name as subjectName, et.name as examTypeName
       FROM exams e
       JOIN subjects s ON e.subjectId = s.id
       JOIN exam_types et ON e.examTypeId = et.id
       WHERE e.classId = ? AND e.date >= CURDATE()
       ORDER BY e.date ASC
       LIMIT 5`,
      [student.classId] // assuming student has classId
    );
    // Actually students table has class (string), but we need classId. We'll join with classes table later.
    // For simplicity, we'll use the class name or classId if available.
    // We can get classId from enrollments or from the class field. We'll use a left join.
    // Let's get classId from enrollments for this student and academic year.
    const [enrollment] = await pool.query(
      `SELECT classId FROM enrollments WHERE studentId = ? AND status = 'Active' ORDER BY id DESC LIMIT 1`,
      [childId]
    );
    const classId = enrollment.length > 0 ? enrollment[0].classId : null;
    let upcomingExamsData = [];
    if (classId) {
      const [exams] = await pool.query(
        `SELECT e.*, s.name as subjectName, et.name as examTypeName
         FROM exams e
         JOIN subjects s ON e.subjectId = s.id
         JOIN exam_types et ON e.examTypeId = et.id
         WHERE e.classId = ? AND e.date >= CURDATE()
         ORDER BY e.date ASC
         LIMIT 5`,
        [classId]
      );
      upcomingExamsData = exams;
    }

    // Get assignments for this class
    let assignments = [];
    if (classId) {
      const [assign] = await pool.query(
        `SELECT * FROM assignments WHERE classId = ? AND status = 'published' AND deadline >= CURDATE()`,
        [classId]
      );
      assignments = assign;
    }

    // Get timetable for this class
    let timetable = [];
    if (classId) {
      const [tt] = await pool.query(
        `SELECT t.*, s.name as subjectName, u.firstName as teacherFirstName, u.lastName as teacherLastName
         FROM timetable t
         JOIN subjects s ON t.subjectId = s.id
         JOIN users u ON t.teacherId = u.id
         WHERE t.classId = ? AND t.dayOfWeek = DAYNAME(CURDATE())
         ORDER BY t.startTime`,
        [classId]
      );
      timetable = tt;
    }

    res.json({
      student,
      attendance: attendance[0] || { present: 0, absent: 0, total: 0 },
      grades,
      feeSummary: feeSummary[0] || { total: 0, balance: 0 },
      upcomingExams: upcomingExamsData,
      assignments,
      timetable
    });
  } catch (error) {
    console.error('Get child dashboard error:', error);
    next(error);
  }
};

module.exports = { getParentByUser, getChildren, getChildDashboard };