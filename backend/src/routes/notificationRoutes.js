const express = require('express');
const { getNotifications, markAsRead, markAllRead, deleteNotification, getUnreadCount } = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllRead);
router.delete('/:id', deleteNotification);

module.exports = router;