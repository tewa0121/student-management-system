const express = require('express');
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
} = require('../controllers/assignmentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('grades.view'), getAssignments);
router.get('/:id', authorize('grades.view'), getAssignment);
router.post('/', authorize('grades.create'), createAssignment);
router.put('/:id', authorize('grades.update'), updateAssignment);
router.delete('/:id', authorize('grades.delete'), deleteAssignment);
router.post('/submit', submitAssignment); // student can submit (add permission check later)
router.put('/submissions/:id/grade', authorize('grades.update'), gradeSubmission);

module.exports = router;