const Assignment = require('../models/Assignment');
const Submission = require('../models/AssignmentSubmission');
const { pool } = require('../config/db');

// Get all assignments
const getAssignments = async (req, res, next) => {
  try {
    const { classId, subjectId, teacherId, status } = req.query;
    const assignments = await Assignment.findAll({ classId, subjectId, teacherId, status });
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

// Get a single assignment with submissions
const getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    const submissions = await Submission.findAll({ assignmentId: req.params.id });
    res.json({ ...assignment, submissions });
  } catch (error) {
    next(error);
  }
};

// Create assignment
const createAssignment = async (req, res, next) => {
  try {
    const { classId, subjectId, teacherId, title, description, deadline, maxScore, attachments, status } = req.body;
    if (!classId || !subjectId || !teacherId || !title || !deadline) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const id = await Assignment.create({ classId, subjectId, teacherId, title, description, deadline, maxScore, attachments, status });
    const newAssignment = await Assignment.findById(id);
    res.status(201).json({ message: 'Assignment created', assignment: newAssignment });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      message: 'Failed to create assignment',
      error: error.message,
      sqlMessage: error.sqlMessage || null,
    });
  }
};

// Update assignment
const updateAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Assignment.findById(id);
    if (!existing) return res.status(404).json({ message: 'Assignment not found' });
    const updated = await Assignment.update(id, req.body);
    if (!updated) return res.status(400).json({ message: 'No changes made' });
    const updatedAssignment = await Assignment.findById(id);
    res.json({ message: 'Assignment updated', assignment: updatedAssignment });
  } catch (error) {
    console.error('Update assignment error:', error);
    next(error);
  }
};

// Delete assignment
const deleteAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Assignment.findById(id);
    if (!existing) return res.status(404).json({ message: 'Assignment not found' });
    await Assignment.delete(id);
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    next(error);
  }
};

// Submit assignment (student)
const submitAssignment = async (req, res, next) => {
  try {
    const { assignmentId, studentId, submissionText, attachment } = req.body;
    if (!assignmentId || !studentId) {
      return res.status(400).json({ message: 'Assignment and student required' });
    }
    // Check if already submitted
    const existing = await Submission.findOne(assignmentId, studentId);
    if (existing) {
      return res.status(400).json({ message: 'Already submitted' });
    }
    const id = await Submission.create({ assignmentId, studentId, submissionText, attachment });
    const newSubmission = await Submission.findById(id);
    res.status(201).json({ message: 'Assignment submitted', submission: newSubmission });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      message: 'Failed to submit assignment',
      error: error.message,
      sqlMessage: error.sqlMessage || null,
    });
  }
};

// Grade submission (teacher)
const gradeSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { grade, feedback } = req.body;
    const submission = await Submission.findById(id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    const updated = await Submission.update(id, { grade, feedback });
    if (!updated) return res.status(400).json({ message: 'No changes made' });
    const updatedSubmission = await Submission.findById(id);
    res.json({ message: 'Submission graded', submission: updatedSubmission });
  } catch (error) {
    console.error('Grade submission error:', error);
    next(error);
  }
};

module.exports = {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
};