const LibraryBook = require('../models/LibraryBook');
const { pool } = require('../config/db');

const getBooks = async (req, res, next) => {
  try {
    const { categoryId, authorId, search } = req.query;
    const books = await LibraryBook.findAll({ categoryId, authorId, search });
    res.json(books);
  } catch (error) { next(error); }
};

const getBook = async (req, res, next) => {
  try {
    const book = await LibraryBook.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) { next(error); }
};

const createBook = async (req, res, next) => {
  try {
    const { 
      isbn, title, authorId, categoryId, publisherId, 
      publicationYear, edition, pages, description, 
      shelfLocation, totalCopies 
    } = req.body;

    if (!title || !authorId || !categoryId) {
      return res.status(400).json({ message: 'Missing required fields: title, authorId, categoryId' });
    }

    const finalPublisherId = publisherId && publisherId !== '' ? parseInt(publisherId) : null;
    const finalTotalCopies = totalCopies && totalCopies !== '' ? parseInt(totalCopies) : 1;

    // Create the book
    const id = await LibraryBook.create({ 
      isbn, title, authorId: parseInt(authorId), categoryId: parseInt(categoryId), 
      publisherId: finalPublisherId, publicationYear, edition, 
      pages: pages ? parseInt(pages) : null, description, shelfLocation, 
      totalCopies: finalTotalCopies 
    });

    // Create copies
    for (let i = 1; i <= finalTotalCopies; i++) {
      await pool.query(
        'INSERT INTO library_copies (bookId, copyNumber, status) VALUES (?, ?, ?)',
        [id, String(i).padStart(2, '0'), 'Available']
      );
    }

    const newBook = await LibraryBook.findById(id);
    res.status(201).json({ message: 'Book added', book: newBook });
  } catch (error) {
    console.error('❌ Create book error:', error);
    res.status(500).json({
      message: 'Failed to add book',
      error: error.message,
      sqlMessage: error.sqlMessage || null,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await LibraryBook.findById(id);
    if (!existing) return res.status(404).json({ message: 'Book not found' });

    const { totalCopies } = req.body;
    // Update basic info
    const updated = await LibraryBook.update(id, req.body);
    if (!updated) return res.status(400).json({ message: 'No changes made' });

    // Handle totalCopies change
    if (totalCopies !== undefined && totalCopies !== null) {
      const newTotal = parseInt(totalCopies);
      const currentTotal = existing.totalCopies;

      if (newTotal > currentTotal) {
        // Add more copies
        const [copies] = await pool.query('SELECT COUNT(*) as count FROM library_copies WHERE bookId = ?', [id]);
        const currentCopyCount = copies[0].count;
        for (let i = currentCopyCount + 1; i <= newTotal; i++) {
          await pool.query(
            'INSERT INTO library_copies (bookId, copyNumber, status) VALUES (?, ?, ?)',
            [id, String(i).padStart(2, '0'), 'Available']
          );
        }
      } else if (newTotal < currentTotal) {
        // Remove extra copies (only those that are Available, not Issued)
        const [toRemove] = await pool.query(
          'SELECT id FROM library_copies WHERE bookId = ? AND status = "Available" ORDER BY id DESC LIMIT ?',
          [id, currentTotal - newTotal]
        );
        for (const row of toRemove) {
          await pool.query('DELETE FROM library_copies WHERE id = ?', [row.id]);
        }
      }
      // Update totalCopies in the book table (already done via update)
    }

    // Recalculate availableCopies
    const [avail] = await pool.query(
      'SELECT COUNT(*) as available FROM library_copies WHERE bookId = ? AND status = "Available"',
      [id]
    );
    await pool.query('UPDATE library_books SET availableCopies = ? WHERE id = ?', [avail[0].available, id]);

    const updatedBook = await LibraryBook.findById(id);
    res.json({ message: 'Book updated', book: updatedBook });
  } catch (error) {
    console.error('Update book error:', error);
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await LibraryBook.findById(id);
    if (!existing) return res.status(404).json({ message: 'Book not found' });
    // Copies will be deleted via CASCADE
    await LibraryBook.delete(id);
    res.json({ message: 'Book deleted' });
  } catch (error) {
    console.error('Delete book error:', error);
    next(error);
  }
};

module.exports = { getBooks, getBook, createBook, updateBook, deleteBook };