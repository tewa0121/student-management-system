const express = require('express');
const multer = require('multer');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getClasses,
  getSections
} = require('../controllers/studentController');
const {
  getStudentIdCard
} = require('../controllers/studentIdCardController');
const {
  importStudents
} = require('../controllers/studentImportController');
const {
  exportStudents
} = require('../controllers/studentExportController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(authenticate);

router.get('/classes', getClasses);
router.get('/sections', getSections);

router.get('/', authorize('students.view'), getStudents);
router.get('/:id', authorize('students.view'), getStudent);
router.post('/', authorize('students.create'), createStudent);
router.put('/:id', authorize('students.update'), updateStudent);
router.delete('/:id', authorize('students.delete'), deleteStudent);

router.get('/:id/id-card', authorize('students.view'), getStudentIdCard);

// Bulk Import
router.post('/import', authorize('students.create'), upload.single('file'), importStudents);

// Bulk Export
router.get('/export', authorize('students.view'), exportStudents);

module.exports = router;