const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const { pool } = require('../config/db');

const getAnnouncements = async (req, res, next) => {
  try {
    const { audience, priority, classId, createdBy, active } = req.query;
    const announcements = await Announcement.findAll({ audience, priority, classId, createdBy, active });
    res.json(announcements);
  } catch (error) { next(error); }
};

const getAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.json(announcement);
  } catch (error) { next(error); }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, priority, audience, classId, sectionId, publishDate, expirationDate, attachment } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    const createdBy = req.user.id;
    const id = await Announcement.create({ title, content, priority, audience, classId, sectionId, publishDate, expirationDate, attachment, createdBy });
    const newAnnouncement = await Announcement.findById(id);

    // --- Send notifications to targeted users ---
    let targetUserIds = [];
    const [adminUsers] = await pool.query('SELECT id FROM users WHERE role IN ("super_admin","admin")');
    const allAdminIds = adminUsers.map(u => u.id);

    if (audience === 'everyone') {
      const [users] = await pool.query('SELECT id FROM users WHERE isActive = TRUE');
      targetUserIds = users.map(u => u.id);
    } else if (audience === 'teachers') {
      const [teachers] = await pool.query('SELECT id FROM users WHERE role = "teacher" AND isActive = TRUE');
      targetUserIds = teachers.map(u => u.id);
    } else if (audience === 'students') {
      const [students] = await pool.query('SELECT id FROM students WHERE status = "Active"');
      const userIds = [];
      for (const s of students) {
        if (s.userId) userIds.push(s.userId);
      }
      targetUserIds = userIds;
    } else if (audience === 'parents') {
      const [parents] = await pool.query('SELECT id FROM users WHERE role = "parent" AND isActive = TRUE');
      targetUserIds = parents.map(u => u.id);
    } else if (audience === 'specific' && classId) {
      const [enrolled] = await pool.query(
        `SELECT DISTINCT s.userId FROM enrollments e
         JOIN students s ON e.studentId = s.id
         WHERE e.classId = ? AND e.status = 'Active'`,
        [classId]
      );
      targetUserIds = enrolled.map(e => e.userId).filter(id => id !== null);
    }

    const allTargets = [...new Set([...targetUserIds, ...allAdminIds])];

    const notificationPromises = allTargets.map(userId => {
      return Notification.create({
        userId,
        type: 'announcement',
        title: `New Announcement: ${title}`,
        message: content.substring(0, 200),
        link: `/announcements/${id}`,
        relatedId: id,
      });
    });
    await Promise.all(notificationPromises);

    res.status(201).json({ message: 'Announcement created and notifications sent', announcement: newAnnouncement });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Failed to create announcement', error: error.message });
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Announcement.findById(id);
    if (!existing) return res.status(404).json({ message: 'Announcement not found' });
    const updated = await Announcement.update(id, req.body);
    if (!updated) return res.status(400).json({ message: 'No changes made' });
    const updatedAnnouncement = await Announcement.findById(id);
    res.json({ message: 'Announcement updated', announcement: updatedAnnouncement });
  } catch (error) {
    console.error('Update announcement error:', error);
    next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Announcement.findById(id);
    if (!existing) return res.status(404).json({ message: 'Announcement not found' });
    await Announcement.delete(id);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    next(error);
  }
};

module.exports = { getAnnouncements, getAnnouncement, createAnnouncement, updateAnnouncement, deleteAnnouncement };