const Term = require('../models/Term');

const getTerms = async (req, res, next) => {
  try {
    const { academicYearId } = req.query;
    const terms = await Term.findAll(academicYearId);
    res.json(terms);
  } catch (error) {
    next(error);
  }
};

const getTerm = async (req, res, next) => {
  try {
    const term = await Term.findById(req.params.id);
    if (!term) return res.status(404).json({ message: 'Term not found' });
    res.json(term);
  } catch (error) {
    next(error);
  }
};

const createTerm = async (req, res, next) => {
  try {
    const { academicYearId, name, startDate, endDate, isActive } = req.body;
    const id = await Term.create({ academicYearId, name, startDate, endDate, isActive });
    const newTerm = await Term.findById(id);
    res.status(201).json({ message: 'Term created', term: newTerm });
  } catch (error) {
    next(error);
  }
};

const updateTerm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Term.findById(id);
    if (!existing) return res.status(404).json({ message: 'Term not found' });
    const updated = await Term.update(id, req.body);
    if (!updated) return res.status(400).json({ message: 'No changes made' });
    const updatedTerm = await Term.findById(id);
    res.json({ message: 'Term updated', term: updatedTerm });
  } catch (error) {
    next(error);
  }
};

const deleteTerm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Term.findById(id);
    if (!existing) return res.status(404).json({ message: 'Term not found' });
    await Term.delete(id);
    res.json({ message: 'Term deleted' });
  } catch (error) {
    next(error);
  }
};

const setActiveTerm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const term = await Term.findById(id);
    if (!term) return res.status(404).json({ message: 'Term not found' });
    await Term.setActive(id, term.academicYearId);
    res.json({ message: 'Active term updated' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTerms,
  getTerm,
  createTerm,
  updateTerm,
  deleteTerm,
  setActiveTerm,
};