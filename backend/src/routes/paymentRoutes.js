const express = require('express');
const {
  getPayments,
  getPayment,
  recordPayment,
  deletePayment,
} = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('payments.create'), getPayments);
router.get('/:id', authorize('payments.create'), getPayment);
router.post('/', authorize('payments.create'), recordPayment);
router.delete('/:id', authorize('payments.refund'), deletePayment);

module.exports = router;