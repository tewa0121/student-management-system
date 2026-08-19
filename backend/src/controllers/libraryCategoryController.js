const Category = require('../models/LibraryCategory');

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) { next(error); }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const id = await Category.create({ name, description });
    const newCat = await Category.findById(id);
    res.status(201).json({ message: 'Category created', category: newCat });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Category.findById(id);
    if (!existing) return res.status(404).json({ message: 'Category not found' });
    const updated = await Category.update(id, req.body);
    if (!updated) return res.status(400).json({ message: 'No changes made' });
    const updatedCat = await Category.findById(id);
    res.json({ message: 'Category updated', category: updatedCat });
  } catch (error) {
    console.error('Update category error:', error);
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Category.findById(id);
    if (!existing) return res.status(404).json({ message: 'Category not found' });
    await Category.delete(id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    next(error);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };