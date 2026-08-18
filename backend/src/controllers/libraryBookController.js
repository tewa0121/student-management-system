const LibraryBook = require('../models/LibraryBook');

const getBooks = async (req, res, next) => {
  try {
    const { categoryId, authorId, search } = req.query;
    const books = await LibraryBook.findAll({ categoryId, authorId, search });
    res.json(books);
  } catch (error) {
    next(error);
  }
};

const getBook = async (req, res, next) => {
  try {
    const book = await LibraryBook.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const { isbn, title, authorId, categoryId, publisherId, publicationYear, edition, pages, description, shelfLocation, totalCopies } = req.body;
    if (!title || !authorId || !categoryId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const id = await LibraryBook.create({ isbn, title, authorId, categoryId, publisherId, publicationYear, edition, pages, description, shelfLocation, totalCopies });
    const newBook = await LibraryBook.findById(id);
    res.status(201).json({ message: 'Book added', book: newBook });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({
      message: 'Failed to add book',
      error: error.message,
      sqlMessage: error.sqlMessage || null,
    });
  }
};

// updateBook, deleteBook similar
const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await LibraryBook.findById(id);
    if (!existing) return res.status(404).json({ message: 'Book not found' });
    const updated = await LibraryBook.update(id, req.body);
    if (!updated) return res.status(400).json({ message: 'No changes made' });
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
    await LibraryBook.delete(id);
    res.json({ message: 'Book deleted' });
  } catch (error) {
    console.error('Delete book error:', error);
    next(error);
  }
};

module.exports = { getBooks, getBook, createBook, updateBook, deleteBook };