const express = require('express');
const {
  getFeeStructures,
  getFeeStructure,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
} = require('../controllers/feeStructureController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('fees.view'), getFeeStructures);
router.get('/:id', authorize('fees.view'), getFeeStructure);
router.post('/', authorize('fees.create'), createFeeStructure);
router.put('/:id', authorize('fees.update'), updateFeeStructure);
router.delete('/:id', authorize('fees.delete'), deleteFeeStructure);

module.exports = router;