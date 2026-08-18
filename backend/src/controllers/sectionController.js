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
    
    if (!classId || !name) {
      return res.status(400).json({ message: 'Class ID and Name are required' });
    }
    
    const classIdNum = parseInt(classId);
    if (isNaN(classIdNum)) {
      return res.status(400).json({ message: 'Class ID must be a number' });
    }
    
    const id = await Section.create({ 
      classId: classIdNum, 
      name, 
      teacherId: teacherId || null, 
      capacity: capacity || 0 
    });
    
    const newSection = await Section.findById(id);
    res.status(201).json({ message: 'Section created', section: newSection });
  } catch (error) {
    console.error('❌ Create section error:', error);
    res.status(500).json({ 
      message: 'Failed to create section', 
      error: error.message,
      sqlMessage: error.sqlMessage || null,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
    console.error('Update section error:', error);
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
    console.error('Delete section error:', error);
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