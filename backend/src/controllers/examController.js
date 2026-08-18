const Exam = require('../models/Exam');

const getExams = async (req, res, next) => {
  try {
    const { classId, subjectId, examTypeId } = req.query;
    const exams = await Exam.findAll({ classId, subjectId, examTypeId });
    res.json(exams);
  } catch (error) {
    next(error);
  }
};

const getExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(exam);
  } catch (error) {
    next(error);
  }
};

const createExam = async (req, res, next) => {
  try {
    const { examTypeId, classId, subjectId, name, date, maxMarks, passingMarks, description } = req.body;
    if (!examTypeId || !classId || !subjectId || !name || !date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const id = await Exam.create({ examTypeId, classId, subjectId, name, date, maxMarks, passingMarks, description });
    const newExam = await Exam.findById(id);
    res.status(201).json({ message: 'Exam created', exam: newExam });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({
      message: 'Failed to create exam',
      error: error.message,
      sqlMessage: error.sqlMessage || null,
    });
  }
};

const updateExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Exam.findById(id);
    if (!existing) return res.status(404).json({ message: 'Exam not found' });
    const updated = await Exam.update(id, req.body);
    if (!updated) return res.status(400).json({ message: 'No changes made' });
    const updatedExam = await Exam.findById(id);
    res.json({ message: 'Exam updated', exam: updatedExam });
  } catch (error) {
    console.error('Update exam error:', error);
    next(error);
  }
};

const deleteExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Exam.findById(id);
    if (!existing) return res.status(404).json({ message: 'Exam not found' });
    await Exam.delete(id);
    res.json({ message: 'Exam deleted' });
  } catch (error) {
    console.error('Delete exam error:', error);
    next(error);
  }
};

module.exports = {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
};