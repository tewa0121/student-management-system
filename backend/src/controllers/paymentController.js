const Payment = require('../models/Payment');
const { pool } = require('../config/db');

// Get all payments
const getPayments = async (req, res, next) => {
  try {
    const { studentId, invoiceId, method } = req.query;
    const payments = await Payment.findAll({ studentId, invoiceId, method });
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

// Get a single payment
const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

// Record a new payment
const recordPayment = async (req, res, next) => {
  try {
    const { invoiceId, studentId, amount, paymentDate, method, referenceNumber, notes } = req.body;
    if (!invoiceId || !studentId || !amount || !paymentDate || !method) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get the invoice to update balance
    const [invoice] = await pool.query('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    if (invoice.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    const inv = invoice[0];
    
    // Check if payment exceeds balance
    const balance = inv.balance;
    if (parseFloat(amount) > parseFloat(balance)) {
      return res.status(400).json({ message: 'Payment amount exceeds outstanding balance' });
    }

    // Generate receipt number
    const [lastPayment] = await pool.query('SELECT receiptNumber FROM payments ORDER BY id DESC LIMIT 1');
    let nextNum = 1;
    if (lastPayment.length > 0) {
      const parts = lastPayment[0].receiptNumber.split('-');
      if (parts.length === 2) {
        nextNum = parseInt(parts[1]) + 1;
      }
    }
    const receiptNumber = `RCP-${String(nextNum).padStart(5, '0')}`;

    // Create payment
    const paymentId = await Payment.create({
      receiptNumber,
      invoiceId,
      studentId,
      amount,
      paymentDate,
      method,
      referenceNumber,
      receivedBy: req.user.id,
      notes,
    });

    // Update invoice paidAmount and balance
    const newPaidAmount = parseFloat(inv.paidAmount) + parseFloat(amount);
    const newBalance = parseFloat(inv.totalAmount) - newPaidAmount - parseFloat(inv.discountAmount) - parseFloat(inv.scholarshipAmount);
    let status = 'Unpaid';
    if (newPaidAmount >= parseFloat(inv.totalAmount) - parseFloat(inv.discountAmount) - parseFloat(inv.scholarshipAmount)) {
      status = 'Paid';
    } else if (newPaidAmount > 0) {
      status = 'Partially Paid';
    }
    await pool.query(
      'UPDATE invoices SET paidAmount = ?, balance = ?, status = ? WHERE id = ?',
      [newPaidAmount, newBalance, status, invoiceId]
    );

    const newPayment = await Payment.findById(paymentId);
    res.status(201).json({ message: 'Payment recorded', payment: newPayment });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({
      message: 'Failed to record payment',
      error: error.message,
      sqlMessage: error.sqlMessage || null,
    });
  }
};

// Delete a payment (with rollback)
const deletePayment = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    await connection.beginTransaction();

    // Remove the payment
    await connection.query('DELETE FROM payments WHERE id = ?', [id]);

    // Recalculate invoice balance
    const [invoice] = await connection.query('SELECT * FROM invoices WHERE id = ?', [payment.invoiceId]);
    const inv = invoice[0];
    const [payments] = await connection.query('SELECT SUM(amount) as totalPaid FROM payments WHERE invoiceId = ?', [inv.id]);
    const totalPaid = payments[0].totalPaid || 0;
    const balance = inv.totalAmount - totalPaid - inv.discountAmount - inv.scholarshipAmount;
    let status = 'Unpaid';
    if (totalPaid >= inv.totalAmount - inv.discountAmount - inv.scholarshipAmount) {
      status = 'Paid';
    } else if (totalPaid > 0) {
      status = 'Partially Paid';
    }
    await connection.query(
      'UPDATE invoices SET paidAmount = ?, balance = ?, status = ? WHERE id = ?',
      [totalPaid, balance, status, inv.id]
    );

    await connection.commit();
    res.json({ message: 'Payment deleted and invoice updated' });
  } catch (error) {
    await connection.rollback();
    console.error('Delete payment error:', error);
    next(error);
  } finally {
    connection.release();
  }
};

module.exports = {
  getPayments,
  getPayment,
  recordPayment,
  deletePayment,
};