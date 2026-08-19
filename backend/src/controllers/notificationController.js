const Notification = require('../models/Notification');

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const notifications = await Notification.findByUser(userId, limit, offset);
    const unread = await Notification.countUnread(userId);
    res.json({ notifications, unread, total: notifications.length });
  } catch (error) { next(error); }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updated = await Notification.markAsRead(id, userId);
    if (!updated) return res.status(404).json({ message: 'Notification not found' });
    const unread = await Notification.countUnread(userId);
    res.json({ message: 'Marked as read', unread });
  } catch (error) { next(error); }
};

const markAllRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updated = await Notification.markAllRead(userId);
    const unread = await Notification.countUnread(userId);
    res.json({ message: `Marked ${updated} notifications as read`, unread });
  } catch (error) { next(error); }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deleted = await Notification.delete(id, userId);
    if (!deleted) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (error) { next(error); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const unread = await Notification.countUnread(userId);
    res.json({ unread });
  } catch (error) { next(error); }
};

module.exports = { getNotifications, markAsRead, markAllRead, deleteNotification, getUnreadCount };