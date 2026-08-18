const Author = require('../models/LibraryAuthor');

const getAuthors = async (req, res, next) => {
  try {
    const authors = await Author.findAll();
    res.json(authors);
  } catch (error) { next(error); }
};

const createAuthor = async (req, res, next) => {
  try {
    const { name, biography } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const id = await Author.create({ name, biography });
    const newAuthor = await Author.findById(id);
    res.status(201).json({ message: 'Author created', author: newAuthor });
  } catch (error) {
    console.error('Create author error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Author.findById(id);
    if (!existing) return res.status(404).json({ message: 'Author not found' });
    const updated = await Author.update(id, req.body);
    if (!updated) return res.status(400).json({ message: 'No changes made' });
    const updatedAuthor = await Author.findById(id);
    res.json({ message: 'Author updated', author: updatedAuthor });
  } catch (error) {
    console.error('Update author error:', error);
    next(error);
  }
};

const deleteAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Author.findById(id);
    if (!existing) return res.status(404).json({ message: 'Author not found' });
    await Author.delete(id);
    res.json({ message: 'Author deleted' });
  } catch (error) {
    console.error('Delete author error:', error);
    next(error);
  }
};

module.exports = {
  getAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor
};