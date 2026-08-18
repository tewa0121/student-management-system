const { pool } = require('../config/db');

const Payment = {
  findAll: async (filters = {}) => {
    let query = `SELECT p.*, s.firstName, s.lastName, s.studentId, i.invoiceNumber 
                 FROM payments p 
                 JOIN students s ON p.studentId = s.id 
                 JOIN invoices i ON p.invoiceId = i.id`;
    const params = [];
    const conditions = [];
    if (filters.studentId) { conditions.push('p.studentId = ?'); params.push(filters.studentId); }
    if (filters.invoiceId) { conditions.push('p.invoiceId = ?'); params.push(filters.invoiceId); }
    if (filters.method) { conditions.push('p.method = ?'); params.push(filters.method); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY p.id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [id]);
    return rows[0];
  },
  findByReceiptNumber: async (receiptNumber) => {
    const [rows] = await pool.query('SELECT * FROM payments WHERE receiptNumber = ?', [receiptNumber]);
    return rows[0];
  },
  generateReceiptNumber: async () => {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM payments');
    const next = (rows[0].count || 0) + 1;
    const year = new Date().getFullYear();
    return `RCPT-${year}-${String(next).padStart(4, '0')}`;
  },
  create: async (data) => {
    const { receiptNumber, invoiceId, studentId, amount, paymentDate, method, referenceNumber, receivedBy, notes } = data;
    const [result] = await pool.query(
      `INSERT INTO payments 
       (receiptNumber, invoiceId, studentId, amount, paymentDate, method, referenceNumber, receivedBy, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [receiptNumber, invoiceId, studentId, amount, paymentDate, method, referenceNumber || null, receivedBy || null, notes || '']
    );
    return result.insertId;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM payments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Payment;