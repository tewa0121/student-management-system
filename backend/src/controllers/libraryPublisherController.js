const Publisher = require('../models/LibraryPublisher');

const getPublishers = async (req, res, next) => {
  try {
    const publishers = await Publisher.findAll();
    res.json(publishers);
  } catch (error) { next(error); }
};

const createPublisher = async (req, res, next) => {
  try {
    const { name, address, phone, email } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const id = await Publisher.create({ name, address, phone, email });
    const newPublisher = await Publisher.findById(id);
    res.status(201).json({ message: 'Publisher created', publisher: newPublisher });
  } catch (error) {
    console.error('Create publisher error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updatePublisher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Publisher.findById(id);
    if (!existing) return res.status(404).json({ message: 'Publisher not found' });
    const updated = await Publisher.update(id, req.body);
    if (!updated) return res.status(400).json({ message: 'No changes made' });
    const updatedPublisher = await Publisher.findById(id);
    res.json({ message: 'Publisher updated', publisher: updatedPublisher });
  } catch (error) {
    console.error('Update publisher error:', error);
    next(error);
  }
};

const deletePublisher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Publisher.findById(id);
    if (!existing) return res.status(404).json({ message: 'Publisher not found' });
    await Publisher.delete(id);
    res.json({ message: 'Publisher deleted' });
  } catch (error) {
    console.error('Delete publisher error:', error);
    next(error);
  }
};

module.exports = { getPublishers, createPublisher, updatePublisher, deletePublisher };