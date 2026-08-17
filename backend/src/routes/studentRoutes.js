const express = require('express');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getClasses,
  getSections
} = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get classes and sections (for filters) - anyone can view these
router.get('/classes', getClasses);
router.get('/sections', getSections);

// Student CRUD
router.get('/', authorize('students.view'), getStudents);
router.get('/:id', authorize('students.view'), getStudent);
router.post('/', authorize('students.create'), createStudent);
router.put('/:id', authorize('students.update'), updateStudent);
router.delete('/:id', authorize('students.delete'), deleteStudent);

module.exports = router;