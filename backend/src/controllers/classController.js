const SchoolClass = require('../models/SchoolClass');

const getClasses = async (req, res, next) => {
  try {
    const classes = await SchoolClass.findAll();
    res.json(classes);
  } catch (error) {
    next(error);
  }
};

const getClass = async (req, res, next) => {
  try {
    const cls = await SchoolClass.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls);
  } catch (error) {
    next(error);
  }
};

const createClass = async (req, res, next) => {
  try {
    const { name, description, capacity } = req.body;
    const id = await SchoolClass.create({ name, description, capacity });
    const newClass = await SchoolClass.findById(id);
    res.status(201).json({ message: 'Class created', class: newClass });
  } catch (error) {
    next(error);
  }
};

const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await SchoolClass.findById(id);
    if (!existing) return res.status(404).json({ message: 'Class not found' });
    const updated = await SchoolClass.update(id, req.body);
    if (!updated) return res.status(400).json({ message: 'No changes made' });
    const updatedClass = await SchoolClass.findById(id);
    res.json({ message: 'Class updated', class: updatedClass });
  } catch (error) {
    next(error);
  }
};

const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await SchoolClass.findById(id);
    if (!existing) return res.status(404).json({ message: 'Class not found' });
    await SchoolClass.delete(id);
    res.json({ message: 'Class deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
};