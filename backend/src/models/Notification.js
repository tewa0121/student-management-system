const { pool } = require('../config/db');

const Notification = {
  findByUser: async (userId, limit = 20, offset = 0) => {
    const [rows] = await pool.query(
      `SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return rows;
  },
  countUnread: async (userId) => {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as unread FROM notifications WHERE userId = ? AND isRead = FALSE',
      [userId]
    );
    return rows[0].unread;
  },
  create: async (data) => {
    const { userId, type, title, message, link, relatedId } = data;
    const [result] = await pool.query(
      `INSERT INTO notifications (userId, type, title, message, link, relatedId) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, title, message, link || null, relatedId || null]
    );
    return result.insertId;
  },
  markAsRead: async (id, userId) => {
    const [result] = await pool.query(
      'UPDATE notifications SET isRead = TRUE WHERE id = ? AND userId = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },
  markAllRead: async (userId) => {
    const [result] = await pool.query(
      'UPDATE notifications SET isRead = TRUE WHERE userId = ? AND isRead = FALSE',
      [userId]
    );
    return result.affectedRows;
  },
  delete: async (id, userId) => {
    const [result] = await pool.query(
      'DELETE FROM notifications WHERE id = ? AND userId = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Notification;