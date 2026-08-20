const { pool } = require('../config/db');

const getGradeScale = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM grade_scale ORDER BY minMarks DESC');
    res.json(rows);
  } catch (error) { next(error); }
};

const updateGradeScale = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { grade, minMarks, maxMarks, gpa, description } = req.body;
    if (!grade || minMarks === undefined || maxMarks === undefined || gpa === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await pool.query(
      'UPDATE grade_scale SET grade = ?, minMarks = ?, maxMarks = ?, gpa = ?, description = ? WHERE id = ?',
      [grade, minMarks, maxMarks, gpa, description || null, id]
    );
    res.json({ message: 'Grade updated successfully' });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({ message: 'Failed to update grade', error: error.message });
  }
};

const addGrade = async (req, res, next) => {
  try {
    const { grade, minMarks, maxMarks, gpa, description } = req.body;
    if (!grade || minMarks === undefined || maxMarks === undefined || gpa === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const [result] = await pool.query(
      'INSERT INTO grade_scale (grade, minMarks, maxMarks, gpa, description) VALUES (?, ?, ?, ?, ?)',
      [grade, minMarks, maxMarks, gpa, description || null]
    );
    const [newRow] = await pool.query('SELECT * FROM grade_scale WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Grade added', grade: newRow[0] });
  } catch (error) {
    console.error('Add grade error:', error);
    res.status(500).json({ message: 'Failed to add grade', error: error.message });
  }
};

const deleteGrade = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM grade_scale WHERE id = ?', [id]);
    res.json({ message: 'Grade deleted' });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({ message: 'Failed to delete grade', error: error.message });
  }
};

module.exports = { getGradeScale, updateGradeScale, addGrade, deleteGrade };