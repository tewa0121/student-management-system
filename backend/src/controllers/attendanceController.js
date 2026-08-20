const Attendance = require('../models/Attendance');

const getAttendance = async (req, res, next) => {
  try {
    const { classId, sectionId, date } = req.query;
    if (!classId || !date) {
      return res.status(400).json({ message: 'classId and date are required' });
    }
    const records = await Attendance.getByClassAndDate(classId, sectionId || null, date);
    res.json(records);
  } catch (error) {
    next(error);
  }
};

const getClassStudents = async (req, res, next) => {
  try {
    const { classId, sectionId } = req.query;
    if (!classId) {
      return res.status(400).json({ message: 'classId is required' });
    }
    const students = await Attendance.getStudentsInClass(classId, sectionId || null);
    res.json(students);
  } catch (error) {
    next(error);
  }
};

const saveAttendance = async (req, res, next) => {
  try {
    const { classId, sectionId, date, records } = req.body;
    if (!classId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'classId, date, and records array are required' });
    }
    const payload = records.map(rec => ({
      studentId: rec.studentId,
      classId,
      sectionId: sectionId || null,
      date,
      status: rec.status,
      note: rec.note || ''
    }));
    await Attendance.saveMultiple(payload);
    res.status(201).json({ message: 'Attendance saved successfully' });
  } catch (error) {
    console.error('Save attendance error:', error);
    res.status(500).json({
      message: 'Failed to save attendance',
      error: error.message,
      sqlMessage: error.sqlMessage || null,
    });
  }
};

const getStudentReport = async (req, res, next) => {
  try {
    const { studentId, startDate, endDate } = req.query;
    if (!studentId || !startDate || !endDate) {
      return res.status(400).json({ message: 'studentId, startDate, endDate required' });
    }
    const records = await Attendance.getStudentReport(studentId, startDate, endDate);
    res.json(records);
  } catch (error) {
    next(error);
  }
};

const getClassSummary = async (req, res, next) => {
  try {
    const { classId, sectionId, startDate, endDate } = req.query;
    if (!classId || !startDate || !endDate) {
      return res.status(400).json({ message: 'classId, startDate, endDate required' });
    }
    const records = await Attendance.getClassSummary(classId, sectionId || null, startDate, endDate);
    res.json(records);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  getClassStudents,
  saveAttendance,
  getStudentReport,
  getClassSummary,
};