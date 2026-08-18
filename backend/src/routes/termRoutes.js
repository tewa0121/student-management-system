const express = require('express');
const {
  getTerms,
  getTerm,
  createTerm,
  updateTerm,
  deleteTerm,
  setActiveTerm,
} = require('../controllers/termController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('academics.view'), getTerms);
router.get('/:id', authorize('academics.view'), getTerm);
router.post('/', authorize('academics.create'), createTerm);
router.put('/:id', authorize('academics.update'), updateTerm);
router.delete('/:id', authorize('academics.delete'), deleteTerm);
router.put('/:id/active', authorize('academics.update'), setActiveTerm);

module.exports = router;