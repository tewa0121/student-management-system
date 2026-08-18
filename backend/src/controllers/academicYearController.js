const AcademicYear = require('../models/AcademicYear');

const getAcademicYears = async (req, res, next) => {
  try {
    const years = await AcademicYear.findAll();
    res.json(years);
  } catch (error) {
    next(error);
  }
};

const getAcademicYear = async (req, res, next) => {
  try {
    const year = await AcademicYear.findById(req.params.id);
    if (!year) return res.status(404).json({ message: 'Academic year not found' });
    res.json(year);
  } catch (error) {
    next(error);
  }
};

const getActiveAcademicYear = async (req, res, next) => {
  try {
    const year = await AcademicYear.findActive();
    if (!year) return res.status(404).json({ message: 'No active academic year found' });
    res.json(year);
  } catch (error) {
    next(error);
  }
};

const createAcademicYear = async (req, res, next) => {
  try {
    const { name, startDate, endDate, isActive } = req.body;
    const id = await AcademicYear.create({ name, startDate, endDate, isActive });
    const newYear = await AcademicYear.findById(id);
    res.status(201).json({ message: 'Academic year created', year: newYear });
  } catch (error) {
    next(error);
  }
};

const updateAcademicYear = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await AcademicYear.findById(id);
    if (!existing) return res.status(404).json({ message: 'Academic year not found' });
    const updated = await AcademicYear.update(id, req.body);
    if (!updated) return res.status(400).json({ message: 'No changes made' });
    const updatedYear = await AcademicYear.findById(id);
    res.json({ message: 'Academic year updated', year: updatedYear });
  } catch (error) {
    next(error);
  }
};

const deleteAcademicYear = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await AcademicYear.findById(id);
    if (!existing) return res.status(404).json({ message: 'Academic year not found' });
    await AcademicYear.delete(id);
    res.json({ message: 'Academic year deleted' });
  } catch (error) {
    next(error);
  }
};

const setActiveAcademicYear = async (req, res, next) => {
  try {
    const { id } = req.params;
    await AcademicYear.setActive(id);
    res.json({ message: 'Active academic year updated' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAcademicYears,
  getAcademicYear,
  getActiveAcademicYear,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  setActiveAcademicYear
};