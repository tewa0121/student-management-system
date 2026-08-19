const express = require('express');
const { getParentByUser, getChildren, getChildDashboard } = require('../controllers/parentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/me', getParentByUser);
router.get('/children', getChildren);
router.get('/children/:childId/dashboard', getChildDashboard);

module.exports = router;