const { pool } = require('../config/db');

const Transaction = {
  findAll: async (filters = {}) => {
    let query = `SELECT t.*, s.firstName, s.lastName, s.studentId, b.title as bookTitle, c.copyNumber
                 FROM library_transactions t
                 JOIN students s ON t.studentId = s.id
                 JOIN library_copies c ON t.copyId = c.id
                 JOIN library_books b ON c.bookId = b.id`;
    const params = [];
    const conditions = [];
    if (filters.studentId) { conditions.push('t.studentId = ?'); params.push(filters.studentId); }
    if (filters.status) { conditions.push('t.status = ?'); params.push(filters.status); }
    if (filters.copyId) { conditions.push('t.copyId = ?'); params.push(filters.copyId); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY t.id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM library_transactions WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { copyId, studentId, issueDate, dueDate, status, notes } = data;
    const [result] = await pool.query(
      `INSERT INTO library_transactions (copyId, studentId, issueDate, dueDate, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [copyId, studentId, issueDate, dueDate, status || 'Issued', notes || '']
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['returnDate', 'status', 'fine', 'notes'];
    for (const field of allowed) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE library_transactions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM library_transactions WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
  // Check if a student has overdue books
  getOverdue: async (studentId) => {
    const [rows] = await pool.query(
      `SELECT * FROM library_transactions WHERE studentId = ? AND status IN ('Issued','Overdue') AND dueDate < CURDATE()`,
      [studentId]
    );
    return rows;
  },
};

module.exports = Transaction;