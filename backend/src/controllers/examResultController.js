const ExamResult = require('../models/ExamResult');
const { pool } = require('../config/db');

const getResults = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const results = await ExamResult.getByExamId(examId);
    res.json(results);
  } catch (error) { next(error); }
};

const saveResults = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { results } = req.body;
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ message: 'Results array required' });
    }

    const [gradeScale] = await pool.query('SELECT * FROM grade_scale ORDER BY maxMarks DESC');
    const [exam] = await pool.query('SELECT maxMarks, passingMarks FROM exams WHERE id = ?', [examId]);
    if (!exam || exam.length === 0) return res.status(404).json({ message: 'Exam not found' });
    const maxMarks = exam[0].maxMarks;
    const passingMarks = exam[0].passingMarks || 40;

    const processed = results.map(r => {
      let marks = parseFloat(r.marksObtained);
      if (isNaN(marks) || marks < 0) marks = 0;
      if (marks > maxMarks) marks = maxMarks;

      let grade = 'F';
      let gpa = 0.0;
      for (const g of gradeScale) {
        if (marks >= g.minMarks && marks <= g.maxMarks) {
          grade = g.grade;
          gpa = parseFloat(g.gpa);
          break;
        }
      }
      return {
        studentId: r.studentId,
        marksObtained: marks,
        grade,
        gpa,
        remarks: r.remarks || '',
      };
    });

    await ExamResult.bulkUpsert(examId, processed);
    const updated = await ExamResult.getByExamId(examId);
    res.json({ message: 'Results saved', results: updated });
  } catch (error) {
    console.error('Save results error:', error);
    res.status(500).json({ message: 'Failed to save results', error: error.message });
  }
};

const getStudentResult = async (req, res, next) => {
  try {
    const { examId, studentId } = req.params;
    const result = await ExamResult.getByExamAndStudent(examId, studentId);
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.json(result);
  } catch (error) { next(error); }
};

module.exports = { getResults, saveResults, getStudentResult };