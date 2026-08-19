const Transaction = require('../models/LibraryTransaction');
const { pool } = require('../config/db');

const getTransactions = async (req, res, next) => {
  try {
    const { studentId, status } = req.query;
    const transactions = await Transaction.findAll({ studentId, status });
    res.json(transactions);
  } catch (error) { next(error); }
};

const issueBook = async (req, res, next) => {
  try {
    const { bookId, studentId, issueDate, dueDate, notes } = req.body;

    if (!bookId || !studentId || !issueDate || !dueDate) {
      return res.status(400).json({ 
        message: 'Missing required fields: bookId, studentId, issueDate, dueDate',
        received: { bookId, studentId, issueDate, dueDate }
      });
    }

    // Find an available copy
    const [copies] = await pool.query(
      'SELECT * FROM library_copies WHERE bookId = ? AND status = "Available" LIMIT 1',
      [bookId]
    );
    if (copies.length === 0) {
      return res.status(400).json({ message: 'No available copies for this book' });
    }
    const copy = copies[0];
    const copyId = copy.id;

    // Create transaction
    const id = await Transaction.create({ copyId, studentId, issueDate, dueDate, status: 'Issued', notes });
    // Update copy status
    await pool.query('UPDATE library_copies SET status = ? WHERE id = ?', ['Issued', copyId]);
    // Decrement availableCopies
    await pool.query(
      'UPDATE library_books SET availableCopies = availableCopies - 1 WHERE id = ?',
      [bookId]
    );

    const newTransaction = await Transaction.findById(id);
    res.status(201).json({ message: 'Book issued', transaction: newTransaction });
  } catch (error) {
    console.error('❌ Issue book error:', error);
    res.status(500).json({ 
      message: 'Failed to issue book', 
      error: error.message, 
      sqlMessage: error.sqlMessage || null 
    });
  }
};

const returnBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.status === 'Returned') return res.status(400).json({ message: 'Book already returned' });

    const returnDate = new Date().toISOString().split('T')[0];
    let fine = 0;
    const dueDate = new Date(transaction.dueDate);
    const now = new Date(returnDate);
    if (now > dueDate) {
      const diffDays = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
      fine = diffDays * 5;
    }
    await Transaction.update(id, { returnDate, status: 'Returned', fine });
    await pool.query('UPDATE library_copies SET status = ? WHERE id = ?', ['Available', transaction.copyId]);
    // Increment availableCopies
    const [bookRow] = await pool.query(
      'SELECT bookId FROM library_copies WHERE id = ?',
      [transaction.copyId]
    );
    const bookId = bookRow[0]?.bookId;
    if (bookId) {
      await pool.query(
        'UPDATE library_books SET availableCopies = availableCopies + 1 WHERE id = ?',
        [bookId]
      );
    }

    const updatedTransaction = await Transaction.findById(id);
    res.json({ message: 'Book returned', transaction: updatedTransaction });
  } catch (error) {
    console.error('❌ Return book error:', error);
    next(error);
  }
};

module.exports = { getTransactions, issueBook, returnBook };