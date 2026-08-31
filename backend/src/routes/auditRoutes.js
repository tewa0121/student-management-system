const express = require('express');
const { getAuditLogs, getAuditLog } = require('../controllers/auditController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Only users with 'audit.view' permission can access logs
router.get('/', authorize('audit.view'), getAuditLogs);
router.get('/:id', authorize('audit.view'), getAuditLog);

module.exports = router;