const FeeStructure = require('../models/FeeStructure');

const getFeeStructures = async (req, res, next) => {
  try {
    const { academicYearId, classId, categoryId } = req.query;
    const structures = await FeeStructure.findAll({ academicYearId, classId, categoryId });
    res.json(structures);
  } catch (error) {
    next(error);
  }
};

const getFeeStructure = async (req, res, next) => {
  try {
    const structure = await FeeStructure.findById(req.params.id);
    if (!structure) return res.status(404).json({ message: 'Fee structure not found' });
    res.json(structure);
  } catch (error) {
    next(error);
  }
};

const createFeeStructure = async (req, res, next) => {
  try {
    const { academicYearId, classId, categoryId, amount, isOptional } = req.body;
    if (!academicYearId || !classId || !categoryId || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const id = await FeeStructure.create({ academicYearId, classId, categoryId, amount, isOptional });
    const newStructure = await FeeStructure.findById(id);
    res.status(201).json({ message: 'Fee structure created', structure: newStructure });
  } catch (error) {
    console.error('Create fee structure error:', error);
    res.status(500).json({
      message: 'Failed to create fee structure',
      error: error.message,
      sqlMessage: error.sqlMessage || null,
    });
  }
};

// update and delete similar...
const updateFeeStructure = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await FeeStructure.findById(id);
    if (!existing) return res.status(404).json({ message: 'Fee structure not found' });
    const updated = await FeeStructure.update(id, req.body);
    if (!updated) return res.status(400).json({ message: 'No changes made' });
    const updatedStructure = await FeeStructure.findById(id);
    res.json({ message: 'Fee structure updated', structure: updatedStructure });
  } catch (error) {
    console.error('Update fee structure error:', error);
    next(error);
  }
};

const deleteFeeStructure = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await FeeStructure.findById(id);
    if (!existing) return res.status(404).json({ message: 'Fee structure not found' });
    await FeeStructure.delete(id);
    res.json({ message: 'Fee structure deleted' });
  } catch (error) {
    console.error('Delete fee structure error:', error);
    next(error);
  }
};

module.exports = {
  getFeeStructures,
  getFeeStructure,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
};