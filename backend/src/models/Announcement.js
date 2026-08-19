const { pool } = require('../config/db');

const Announcement = {
  findAll: async (filters = {}) => {
    let query = `SELECT a.*, u.firstName, u.lastName, c.name as className, s.name as sectionName
                 FROM announcements a
                 JOIN users u ON a.createdBy = u.id
                 LEFT JOIN classes c ON a.classId = c.id
                 LEFT JOIN sections s ON a.sectionId = s.id`;
    const params = [];
    const conditions = [];
    if (filters.audience) { conditions.push('a.audience = ?'); params.push(filters.audience); }
    if (filters.priority) { conditions.push('a.priority = ?'); params.push(filters.priority); }
    if (filters.classId) { conditions.push('a.classId = ?'); params.push(filters.classId); }
    if (filters.createdBy) { conditions.push('a.createdBy = ?'); params.push(filters.createdBy); }
    if (filters.active) {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      conditions.push('(a.expirationDate IS NULL OR a.expirationDate > ?)');
      params.push(now);
    }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY a.priority DESC, a.publishDate DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM announcements WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { title, content, priority, audience, classId, sectionId, publishDate, expirationDate, attachment, createdBy } = data;
    const [result] = await pool.query(
      `INSERT INTO announcements 
       (title, content, priority, audience, classId, sectionId, publishDate, expirationDate, attachment, createdBy) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, content, priority || 'normal', audience || 'everyone', classId || null, sectionId || null, publishDate || new Date(), expirationDate || null, attachment || null, createdBy]
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['title', 'content', 'priority', 'audience', 'classId', 'sectionId', 'publishDate', 'expirationDate', 'attachment'];
    for (const field of allowed) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE announcements SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Announcement;