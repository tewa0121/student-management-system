const express = require('express');
const {
  getInvoices,
  getInvoice,
  generateInvoice,
  updateInvoice,
  deleteInvoice,
} = require('../controllers/invoiceController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('fees.view'), getInvoices);
router.get('/:id', authorize('fees.view'), getInvoice);
router.post('/generate', authorize('fees.create'), generateInvoice);
router.put('/:id', authorize('fees.update'), updateInvoice);
router.delete('/:id', authorize('fees.delete'), deleteInvoice);

module.exports = router;