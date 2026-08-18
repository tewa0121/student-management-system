const express = require('express');
const {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
} = require('../controllers/examController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('grades.view'), getExams);
router.get('/:id', authorize('grades.view'), getExam);
router.post('/', authorize('grades.create'), createExam);
router.put('/:id', authorize('grades.update'), updateExam);
router.delete('/:id', authorize('grades.delete'), deleteExam);

module.exports = router;