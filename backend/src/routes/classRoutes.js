const express = require('express');
const {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
} = require('../controllers/classController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('academics.view'), getClasses);
router.get('/:id', authorize('academics.view'), getClass);
router.post('/', authorize('academics.create'), createClass);
router.put('/:id', authorize('academics.update'), updateClass);
router.delete('/:id', authorize('academics.delete'), deleteClass);

module.exports = router;