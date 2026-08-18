const { pool } = require('../config/db');

const Copy = {
  findByBookId: async (bookId) => {
    const [rows] = await pool.query('SELECT * FROM library_copies WHERE bookId = ?', [bookId]);
    return rows;
  },
  create: async (data) => {
    const { bookId, copyNumber, status } = data;
    const [result] = await pool.query(
      'INSERT INTO library_copies (bookId, copyNumber, status) VALUES (?, ?, ?)',
      [bookId, copyNumber, status || 'Available']
    );
    return result.insertId;
  },
  updateStatus: async (id, status) => {
    const [result] = await pool.query('UPDATE library_copies SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM library_copies WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Copy;