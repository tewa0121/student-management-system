const Section = require('../models/Section');

const getSections = async (req, res, next) => {
  try {
    const { classId } = req.query;
    const sections = await Section.findAll(classId);
    res.json(sections);
  } catch (error) {
    next(error);
  }
};

const getSection = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    res.json(section);
  } catch (error) {
    next(error);
  }
};

const createSection = async (req, res, next) => {
  try {
    const { classId, name, teacherId, capacity } = req.body;
    const id = await Section.create({ classId, name, teacherId, capacity });
    const newSection = await Section.findById(id);
    res.status(201).json({ message: 'Section created', section: newSection });
  } catch (error) {
    next(error);
  }
};

const updateSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Section.findById(id);
    if (!existing) return res.status(404).json({ message: 'Section not found' });
    const updated = await Section.update(id, req.body);
    if (!updated) return res.status(400).json({ message: 'No changes made' });
    const updatedSection = await Section.findById(id);
    res.json({ message: 'Section updated', section: updatedSection });
  } catch (error) {
    next(error);
  }
};

const deleteSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Section.findById(id);
    if (!existing) return res.status(404).json({ message: 'Section not found' });
    await Section.delete(id);
    res.json({ message: 'Section deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
};