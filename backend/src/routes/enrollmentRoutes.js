const express = require('express');
const {
  getEnrollments,
  getEnrollment,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
} = require('../controllers/enrollmentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('academics.view'), getEnrollments);
router.get('/:id', authorize('academics.view'), getEnrollment);
router.post('/', authorize('academics.create'), createEnrollment);
router.put('/:id', authorize('academics.update'), updateEnrollment);
router.delete('/:id', authorize('academics.delete'), deleteEnrollment);

module.exports = router;