const express = require('express');
const { getFeeCategories } = require('../controllers/feeCategoryController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', authorize('fees.view'), getFeeCategories);

module.exports = router;