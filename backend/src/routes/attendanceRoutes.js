const express = require('express');
const {
  getAttendance,
  getClassStudents,
  saveAttendance,
  getStudentReport,
  getClassSummary,
} = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('attendance.view'), getAttendance);
router.get('/students', authorize('attendance.view'), getClassStudents);
router.post('/', authorize('attendance.create'), saveAttendance);
router.get('/report/student', authorize('attendance.view'), getStudentReport);
router.get('/report/class', authorize('attendance.view'), getClassSummary);

module.exports = router;