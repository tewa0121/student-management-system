const express = require('express');
const {
  getAcademicYears,
  getAcademicYear,
  getActiveAcademicYear,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  setActiveAcademicYear
} = require('../controllers/academicYearController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('academics.view'), getAcademicYears);
router.get('/active', authorize('academics.view'), getActiveAcademicYear);
router.get('/:id', authorize('academics.view'), getAcademicYear);
router.post('/', authorize('academics.create'), createAcademicYear);
router.put('/:id', authorize('academics.update'), updateAcademicYear);
router.delete('/:id', authorize('academics.delete'), deleteAcademicYear);
router.put('/:id/active', authorize('academics.update'), setActiveAcademicYear);

module.exports = router;