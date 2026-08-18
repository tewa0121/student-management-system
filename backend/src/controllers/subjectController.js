const Subject = require('../models/Subject');

const getSubjects = async (req, res, next) => {
  try {
    const { classId } = req.query;
    const subjects = await Subject.findAll(classId);
    res.json(subjects);
  } catch (error) {
    next(error);
  }
};

const getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    next(error);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const { code, name, description, classId, creditHours, maxMarks, passingMarks, isElective } = req.body;
    
    // Check duplicate code
    const existing = await Subject.findByCode(code);
    if (existing) {
      return res.status(400).json({ message: 'Subject code already exists' });
    }
    
    const id = await Subject.create({ 
      code, name, description, classId: classId || null, 
      creditHours, maxMarks, passingMarks, isElective 
    });
    const newSubject = await Subject.findById(id);
    res.status(201).json({ message: 'Subject created', subject: newSubject });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ 
      message: 'Failed to create subject', 
      error: error.message,
      sqlMessage: error.sqlMessage || null
    });
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Subject.findById(id);
    if (!existing) return res.status(404).json({ message: 'Subject not found' });
    
    // If code is changing, check for duplicate
    if (req.body.code && req.body.code !== existing.code) {
      const dup = await Subject.findByCode(req.body.code);
      if (dup) return res.status(400).json({ message: 'Subject code already exists' });
    }
    
    const updated = await Subject.update(id, req.body);
    if (!updated) return res.status(400).json({ message: 'No changes made' });
    const updatedSubject = await Subject.findById(id);
    res.json({ message: 'Subject updated', subject: updatedSubject });
  } catch (error) {
    console.error('Update subject error:', error);
    next(error);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Subject.findById(id);
    if (!existing) return res.status(404).json({ message: 'Subject not found' });
    await Subject.delete(id);
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    console.error('Delete subject error:', error);
    next(error);
  }
};

module.exports = {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
};