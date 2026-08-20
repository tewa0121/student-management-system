const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', authorize('settings.view'), getSettings);
router.put('/', authorize('settings.update'), updateSettings);

module.exports = router;