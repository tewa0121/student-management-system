// const express = require('express');
// const {
//   getExams,
//   getExam,
//   createExam,
//   updateExam,
//   deleteExam,
// } = require('../controllers/examController');

// const {
//   getResults,
//   saveResults,
//   getStudentResult,
// } = require('../controllers/examResultController');

// const { authenticate, authorize } = require('../middleware/auth');

// const router = express.Router();

// router.use(authenticate);

// // Exam CRUD
// router.get('/', authorize('grades.view'), getExams);
// router.get('/:id', authorize('grades.view'), getExam);
// router.post('/', authorize('grades.create'), createExam);
// router.put('/:id', authorize('grades.update'), updateExam);
// router.delete('/:id', authorize('grades.delete'), deleteExam);

// // Exam Results
// router.get('/:examId/results', authorize('grades.view'), getResults);
// router.post('/:examId/results', authorize('grades.create'), saveResults);
// router.get('/:examId/students/:studentId/result', authorize('grades.view'), getStudentResult);

// module.exports = router;