const express = require('express');
const {
  getSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
} = require('../controllers/sectionController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('academics.view'), getSections);
router.get('/:id', authorize('academics.view'), getSection);
router.post('/', authorize('academics.create'), createSection);
router.put('/:id', authorize('academics.update'), updateSection);
router.delete('/:id', authorize('academics.delete'), deleteSection);

module.exports = router;