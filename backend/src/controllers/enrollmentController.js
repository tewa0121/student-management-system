const Enrollment = require('../models/Enrollment');

const getEnrollments = async (req, res, next) => {
  try {
    const { academicYearId, classId, sectionId, studentId, status } = req.query;
    const enrollments = await Enrollment.findAll({ academicYearId, classId, sectionId, studentId, status });
    res.json(enrollments);
  } catch (error) {
    next(error);
  }
};

const getEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    res.json(enrollment);
  } catch (error) {
    next(error);
  }
};

const createEnrollment = async (req, res, next) => {
  try {
    const { studentId, academicYearId, classId, sectionId, enrollmentDate, status } = req.body;
    
    // Check for duplicate active enrollment (prevent multiple active for same student/academic year/class)
    // We'll check in the model or controller – we can add a check here if needed.
    
    const id = await Enrollment.create({ studentId, academicYearId, classId, sectionId, enrollmentDate, status });
    const newEnrollment = await Enrollment.findById(id);
    // We need the full join data, but we can fetch it with a separate query.
    // For simplicity, we return the ID; the client can refresh the list.
    res.status(201).json({ message: 'Enrollment created', enrollment: newEnrollment });
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({
      message: 'Failed to create enrollment',
      error: error.message,
      sqlMessage: error.sqlMessage || null,
    });
  }
};

const updateEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Enrollment.findById(id);
    if (!existing) return res.status(404).json({ message: 'Enrollment not found' });
    const updated = await Enrollment.update(id, req.body);
    if (!updated) return res.status(400).json({ message: 'No changes made' });
    const updatedEnrollment = await Enrollment.findById(id);
    res.json({ message: 'Enrollment updated', enrollment: updatedEnrollment });
  } catch (error) {
    console.error('Update enrollment error:', error);
    next(error);
  }
};

const deleteEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Enrollment.findById(id);
    if (!existing) return res.status(404).json({ message: 'Enrollment not found' });
    await Enrollment.delete(id);
    res.json({ message: 'Enrollment deleted' });
  } catch (error) {
    console.error('Delete enrollment error:', error);
    next(error);
  }
};

module.exports = {
  getEnrollments,
  getEnrollment,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
};