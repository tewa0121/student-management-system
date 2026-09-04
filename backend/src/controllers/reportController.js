const { pool } = require('../config/db');

const getDashboardStats = async (req, res, next) => {
  try {
    const [students] = await pool.query('SELECT COUNT(*) as total FROM students WHERE status = "Active"');
    const [teachers] = await pool.query('SELECT COUNT(*) as total FROM users WHERE role = "teacher" AND isActive = TRUE');
    const [classes] = await pool.query('SELECT COUNT(*) as total FROM classes');
    const today = new Date().toISOString().split('T')[0];
    const [attendance] = await pool.query(
      'SELECT COUNT(*) as total FROM attendance WHERE date = ? AND status = "Present"',
      [today]
    );
    const [fees] = await pool.query('SELECT SUM(balance) as total FROM invoices WHERE status != "Paid"');
    const monthStart = new Date();
    monthStart.setDate(1);
    const [collected] = await pool.query(
      'SELECT SUM(amount) as total FROM payments WHERE paymentDate >= ?',
      [monthStart.toISOString().split('T')[0]]
    );
    const weekLater = new Date();
    weekLater.setDate(weekLater.getDate() + 7);
    const [exams] = await pool.query(
      'SELECT COUNT(*) as total FROM exams WHERE date BETWEEN ? AND ?',
      [today, weekLater.toISOString().split('T')[0]]
    );
    const [events] = await pool.query(
      'SELECT COUNT(*) as total FROM announcements WHERE expirationDate BETWEEN ? AND ?',
      [today, weekLater.toISOString().split('T')[0]]
    );

    res.json({
      totalStudents: students[0].total || 0,
      totalTeachers: teachers[0].total || 0,
      totalClasses: classes[0].total || 0,
      attendanceToday: attendance[0].total || 0,
      outstandingFees: fees[0].total || 0,
      feesCollected: collected[0].total || 0,
      upcomingExams: exams[0].total || 0,
      upcomingEvents: events[0].total || 0,
    });
  } catch (error) {
    next(error);
  }
};

const getStudentDemographics = async (req, res, next) => {
  try {
    const [byGender] = await pool.query('SELECT gender, COUNT(*) as count FROM students GROUP BY gender');
    const [byClass] = await pool.query('SELECT class, COUNT(*) as count FROM students WHERE class IS NOT NULL GROUP BY class ORDER BY class');
    const [byAcademicYear] = await pool.query(
      'SELECT a.name as year, COUNT(e.studentId) as count FROM enrollments e JOIN academic_years a ON e.academicYearId = a.id GROUP BY a.id'
    );
    res.json({ byGender, byClass, byAcademicYear });
  } catch (error) {
    next(error);
  }
};

const getAttendanceTrends = async (req, res, next) => {
  try {
    const { period = 'daily' } = req.query;
    let query;
    if (period === 'daily') {
      query = 'SELECT date, COUNT(*) as present FROM attendance WHERE status = "Present" GROUP BY date ORDER BY date DESC LIMIT 30';
    } else if (period === 'weekly') {
      query = 'SELECT YEARWEEK(date) as week, COUNT(*) as present FROM attendance WHERE status = "Present" GROUP BY week ORDER BY week DESC LIMIT 12';
    } else if (period === 'monthly') {
      query = 'SELECT DATE_FORMAT(date, "%Y-%m") as month, COUNT(*) as present FROM attendance WHERE status = "Present" GROUP BY month ORDER BY month DESC LIMIT 12';
    }
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

const getFinancialReports = async (req, res, next) => {
  try {
    const [monthlyRevenue] = await pool.query(
      'SELECT DATE_FORMAT(paymentDate, "%Y-%m") as month, SUM(amount) as total FROM payments GROUP BY month ORDER BY month DESC LIMIT 12'
    );
    const [outstandingByClass] = await pool.query(
      `SELECT c.name as className, SUM(i.balance) as outstanding
       FROM invoices i
       JOIN enrollments e ON i.studentId = e.studentId
       JOIN classes c ON e.classId = c.id
       WHERE i.status != 'Paid'
       GROUP BY c.id`
    );
    const [paymentMethods] = await pool.query(
      'SELECT method, COUNT(*) as count, SUM(amount) as total FROM payments GROUP BY method'
    );
    res.json({ monthlyRevenue, outstandingByClass, paymentMethods });
  } catch (error) {
    next(error);
  }
};

const getAcademicPerformance = async (req, res, next) => {
  try {
    const [subjectAvg] = await pool.query(
      `SELECT sub.name, AVG(er.marksObtained) as avgMarks
       FROM exam_results er
       JOIN exams e ON er.examId = e.id
       JOIN subjects sub ON e.subjectId = sub.id
       GROUP BY sub.id`
    );
    const [passFail] = await pool.query(
      `SELECT
         SUM(CASE WHEN er.marksObtained >= e.passingMarks THEN 1 ELSE 0 END) as passed,
         SUM(CASE WHEN er.marksObtained < e.passingMarks THEN 1 ELSE 0 END) as failed
       FROM exam_results er
       JOIN exams e ON er.examId = e.id`
    );
    const [topStudents] = await pool.query(
      `SELECT s.firstName, s.lastName, s.studentId, AVG(er.marksObtained) as avg
       FROM exam_results er
       JOIN students s ON er.studentId = s.id
       GROUP BY s.id
       ORDER BY avg DESC
       LIMIT 10`
    );
    res.json({ subjectAvg, passFail, topStudents });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getStudentDemographics,
  getAttendanceTrends,
  getFinancialReports,
  getAcademicPerformance,
};