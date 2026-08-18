const { pool } = require('../config/db');

const Invoice = {
  findAll: async (filters = {}) => {
    let query = `SELECT i.*, s.firstName, s.lastName, s.studentId, a.name as academicYearName 
                 FROM invoices i 
                 JOIN students s ON i.studentId = s.id 
                 JOIN academic_years a ON i.academicYearId = a.id`;
    const params = [];
    const conditions = [];
    if (filters.studentId) { conditions.push('i.studentId = ?'); params.push(filters.studentId); }
    if (filters.academicYearId) { conditions.push('i.academicYearId = ?'); params.push(filters.academicYearId); }
    if (filters.status) { conditions.push('i.status = ?'); params.push(filters.status); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY i.id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
    return rows[0];
  },
  findByInvoiceNumber: async (invoiceNumber) => {
    const [rows] = await pool.query('SELECT * FROM invoices WHERE invoiceNumber = ?', [invoiceNumber]);
    return rows[0];
  },
  create: async (data) => {
    const { invoiceNumber, studentId, academicYearId, issueDate, dueDate, totalAmount, discountAmount, scholarshipAmount, netAmount, paidAmount, balance, status, notes } = data;
    const [result] = await pool.query(
      `INSERT INTO invoices 
       (invoiceNumber, studentId, academicYearId, issueDate, dueDate, totalAmount, discountAmount, scholarshipAmount, netAmount, paidAmount, balance, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [invoiceNumber, studentId, academicYearId, issueDate, dueDate, totalAmount, discountAmount || 0, scholarshipAmount || 0, netAmount, paidAmount || 0, balance, status || 'Unpaid', notes || '']
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['status', 'paidAmount', 'balance', 'notes', 'discountAmount', 'scholarshipAmount'];
    for (const field of allowed) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE invoices SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM invoices WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
  // Generate invoice items from fee structures
  generateInvoiceItems: async (invoiceId, studentId, academicYearId, classId) => {
    // Get fee structures for the student's class and academic year
    const [structures] = await pool.query(
      `SELECT fs.*, fc.name as categoryName 
       FROM fee_structures fs 
       JOIN fee_categories fc ON fs.categoryId = fc.id 
       WHERE fs.classId = ? AND fs.academicYearId = ?`,
      [classId, academicYearId]
    );
    const items = [];
    for (const struct of structures) {
      const total = struct.amount;
      await pool.query(
        `INSERT INTO invoice_items (invoiceId, feeStructureId, description, quantity, unitPrice, total) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [invoiceId, struct.id, struct.categoryName, 1, struct.amount, total]
      );
      items.push(total);
    }
    return items;
  }
};

module.exports = Invoice;