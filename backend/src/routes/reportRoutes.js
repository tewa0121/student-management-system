const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getStudentDemographics,
  getAttendanceTrends,
  getFinancialReports,
  getAcademicPerformance,
} = require('../controllers/reportController');

const router = express.Router();

router.use(authenticate);

router.get('/dashboard-stats', authorize('academics.view'), getDashboardStats);
router.get('/student-demographics', authorize('academics.view'), getStudentDemographics);
router.get('/attendance-trends', authorize('academics.view'), getAttendanceTrends);
router.get('/financial', authorize('fees.view'), getFinancialReports);
router.get('/academic-performance', authorize('grades.view'), getAcademicPerformance);

module.exports = router;