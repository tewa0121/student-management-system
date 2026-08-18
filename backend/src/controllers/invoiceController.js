const Invoice = require('../models/Invoice');
const { pool } = require('../config/db');

// Get all invoices with filters
const getInvoices = async (req, res, next) => {
  try {
    const { studentId, academicYearId, status } = req.query;
    const invoices = await Invoice.findAll({ studentId, academicYearId, status });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

// Get a single invoice with its items
const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    const [items] = await pool.query('SELECT * FROM invoice_items WHERE invoiceId = ?', [req.params.id]);
    res.json({ ...invoice, items });
  } catch (error) {
    next(error);
  }
};

// Generate an invoice for a student
const generateInvoice = async (req, res, next) => {
  try {
    const { studentId, academicYearId, issueDate, dueDate } = req.body;
    if (!studentId || !academicYearId || !issueDate || !dueDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get student's class from enrollment (active enrollment for that academic year)
    const [enrollment] = await pool.query(
      `SELECT classId FROM enrollments WHERE studentId = ? AND academicYearId = ? AND status = 'Active'`,
      [studentId, academicYearId]
    );
    if (!enrollment || enrollment.length === 0) {
      return res.status(400).json({ message: 'Student is not enrolled in any class for this academic year' });
    }
    const classId = enrollment[0].classId;

    // Get fee structures for that class and academic year
    const [structures] = await pool.query(
      `SELECT fs.*, fc.name as categoryName 
       FROM fee_structures fs 
       JOIN fee_categories fc ON fs.categoryId = fc.id 
       WHERE fs.classId = ? AND fs.academicYearId = ?`,
      [classId, academicYearId]
    );
    if (structures.length === 0) {
      return res.status(400).json({ message: 'No fee structures found for this class and academic year' });
    }

    // Calculate totals
    let totalAmount = 0;
    for (const struct of structures) {
      totalAmount += parseFloat(struct.amount);
    }
    const discountAmount = 0; // can be set later
    const scholarshipAmount = 0;
    const netAmount = totalAmount;
    const paidAmount = 0;
    const balance = netAmount;

    // Generate unique invoice number
    const [lastInvoice] = await pool.query('SELECT invoiceNumber FROM invoices ORDER BY id DESC LIMIT 1');
    let nextNum = 1;
    if (lastInvoice.length > 0) {
      const parts = lastInvoice[0].invoiceNumber.split('-');
      if (parts.length === 2) {
        nextNum = parseInt(parts[1]) + 1;
      }
    }
    const invoiceNumber = `INV-${String(nextNum).padStart(5, '0')}`;

    // Create invoice
    const invoiceId = await Invoice.create({
      invoiceNumber,
      studentId,
      academicYearId,
      issueDate,
      dueDate,
      totalAmount,
      discountAmount,
      scholarshipAmount,
      netAmount,
      paidAmount,
      balance,
      status: 'Unpaid',
      notes: ''
    });

    // Generate invoice items
    await Invoice.generateInvoiceItems(invoiceId, studentId, academicYearId, classId);

    // Fetch the created invoice with items
    const newInvoice = await Invoice.findById(invoiceId);
    const [items] = await pool.query('SELECT * FROM invoice_items WHERE invoiceId = ?', [invoiceId]);
    res.status(201).json({ message: 'Invoice generated successfully', invoice: { ...newInvoice, items } });
  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({
      message: 'Failed to generate invoice',
      error: error.message,
      sqlMessage: error.sqlMessage || null,
    });
  }
};

// Update invoice (e.g., mark as paid)
const updateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Invoice.findById(id);
    if (!existing) return res.status(404).json({ message: 'Invoice not found' });
    const updated = await Invoice.update(id, req.body);
    if (!updated) return res.status(400).json({ message: 'No changes made' });
    const updatedInvoice = await Invoice.findById(id);
    res.json({ message: 'Invoice updated', invoice: updatedInvoice });
  } catch (error) {
    console.error('Update invoice error:', error);
    next(error);
  }
};

// Delete invoice
const deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Invoice.findById(id);
    if (!existing) return res.status(404).json({ message: 'Invoice not found' });
    // Also delete items (cascades)
    await Invoice.delete(id);
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    next(error);
  }
};

module.exports = {
  getInvoices,
  getInvoice,
  generateInvoice,
  updateInvoice,
  deleteInvoice,
};