const express = require('express');
const { getAnnouncements, getAnnouncement, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('announcements.view'), getAnnouncements);
router.get('/:id', authorize('announcements.view'), getAnnouncement);
router.post('/', authorize('announcements.create'), createAnnouncement);
router.put('/:id', authorize('announcements.update'), updateAnnouncement);
router.delete('/:id', authorize('announcements.delete'), deleteAnnouncement);

module.exports = router;