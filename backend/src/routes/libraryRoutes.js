const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

// Book controllers
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/libraryBookController');

// Transaction controllers
const {
  issueBook,
  returnBook,
  getTransactions
} = require('../controllers/libraryTransactionController');

// Category controllers
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/libraryCategoryController');

// Author controllers
const {
  getAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor
} = require('../controllers/libraryAuthorController');

// Publisher controllers
const {
  getPublishers,
  createPublisher,
  updatePublisher,
  deletePublisher
} = require('../controllers/libraryPublisherController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ============ BOOKS ============
router.get('/books', authorize('academics.view'), getBooks);
router.get('/books/:id', authorize('academics.view'), getBook);
router.post('/books', authorize('academics.create'), createBook);
router.put('/books/:id', authorize('academics.update'), updateBook);
router.delete('/books/:id', authorize('academics.delete'), deleteBook);

// ============ TRANSACTIONS ============
router.get('/transactions', authorize('academics.view'), getTransactions);
router.post('/transactions/issue', authorize('academics.create'), issueBook);
router.put('/transactions/:id/return', authorize('academics.update'), returnBook);

// ============ CATEGORIES ============
router.get('/categories', authorize('academics.view'), getCategories);
router.post('/categories', authorize('academics.create'), createCategory);
router.put('/categories/:id', authorize('academics.update'), updateCategory);
router.delete('/categories/:id', authorize('academics.delete'), deleteCategory);

// ============ AUTHORS ============
router.get('/authors', authorize('academics.view'), getAuthors);
router.post('/authors', authorize('academics.create'), createAuthor);
router.put('/authors/:id', authorize('academics.update'), updateAuthor);
router.delete('/authors/:id', authorize('academics.delete'), deleteAuthor);

// ============ PUBLISHERS ============
router.get('/publishers', authorize('academics.view'), getPublishers);
router.post('/publishers', authorize('academics.create'), createPublisher);
router.put('/publishers/:id', authorize('academics.update'), updatePublisher);
router.delete('/publishers/:id', authorize('academics.delete'), deletePublisher);

module.exports = router;