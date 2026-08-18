const express = require('express');
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('academics.view'), getSubjects);
router.get('/:id', authorize('academics.view'), getSubject);
router.post('/', authorize('academics.create'), createSubject);
router.put('/:id', authorize('academics.update'), updateSubject);
router.delete('/:id', authorize('academics.delete'), deleteSubject);

module.exports = router;