const Timetable = require('../models/Timetable');

// Get timetable entries
const getTimetable = async (req, res, next) => {
  try {
    const { classId, sectionId, academicYearId, termId, teacherId, dayOfWeek } = req.query;
    const entries = await Timetable.findAll({ classId, sectionId, academicYearId, termId, teacherId, dayOfWeek });
    res.json(entries);
  } catch (error) {
    next(error);
  }
};

// Get a single entry
const getTimetableEntry = async (req, res, next) => {
  try {
    const entry = await Timetable.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Timetable entry not found' });
    res.json(entry);
  } catch (error) {
    next(error);
  }
};

// Create a timetable entry with conflict checks
const createTimetableEntry = async (req, res, next) => {
  try {
    const { classId, sectionId, academicYearId, termId, dayOfWeek, startTime, endTime, subjectId, teacherId, room } = req.body;
    if (!classId || !academicYearId || !dayOfWeek || !startTime || !endTime || !subjectId || !teacherId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check teacher conflict
    const teacherConflicts = await Timetable.checkTeacherConflict(teacherId, dayOfWeek, startTime, endTime);
    if (teacherConflicts.length > 0) {
      return res.status(400).json({ message: 'Teacher is already scheduled at this time', conflicts: teacherConflicts });
    }

    // Check room conflict
    if (room) {
      const roomConflicts = await Timetable.checkRoomConflict(room, dayOfWeek, startTime, endTime);
      if (roomConflicts.length > 0) {
        return res.status(400).json({ message: 'Room is already booked at this time', conflicts: roomConflicts });
      }
    }

    const id = await Timetable.create({ classId, sectionId, academicYearId, termId, dayOfWeek, startTime, endTime, subjectId, teacherId, room });
    const newEntry = await Timetable.findById(id);
    res.status(201).json({ message: 'Timetable entry created', entry: newEntry });
  } catch (error) {
    console.error('Create timetable error:', error);
    res.status(500).json({
      message: 'Failed to create timetable entry',
      error: error.message,
      sqlMessage: error.sqlMessage || null,
    });
  }
};

// Update entry with conflict checks
const updateTimetableEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Timetable.findById(id);
    if (!existing) return res.status(404).json({ message: 'Timetable entry not found' });

    const { teacherId, room, dayOfWeek, startTime, endTime } = req.body;
    // Use existing values if not provided
    const finalTeacherId = teacherId || existing.teacherId;
    const finalDay = dayOfWeek || existing.dayOfWeek;
    const finalStart = startTime || existing.startTime;
    const finalEnd = endTime || existing.endTime;
    const finalRoom = room !== undefined ? room : existing.room;

    // Check teacher conflict (excluding self)
    if (finalTeacherId && finalDay && finalStart && finalEnd) {
      const teacherConflicts = await Timetable.checkTeacherConflict(finalTeacherId, finalDay, finalStart, finalEnd, id);
      if (teacherConflicts.length > 0) {
        return res.status(400).json({ message: 'Teacher is already scheduled at this time', conflicts: teacherConflicts });
      }
    }
    if (finalRoom) {
      const roomConflicts = await Timetable.checkRoomConflict(finalRoom, finalDay, finalStart, finalEnd, id);
      if (roomConflicts.length > 0) {
        return res.status(400).json({ message: 'Room is already booked at this time', conflicts: roomConflicts });
      }
    }

    const updated = await Timetable.update(id, req.body);
    if (!updated) return res.status(400).json({ message: 'No changes made' });
    const updatedEntry = await Timetable.findById(id);
    res.json({ message: 'Timetable entry updated', entry: updatedEntry });
  } catch (error) {
    console.error('Update timetable error:', error);
    next(error);
  }
};

const deleteTimetableEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Timetable.findById(id);
    if (!existing) return res.status(404).json({ message: 'Timetable entry not found' });
    await Timetable.delete(id);
    res.json({ message: 'Timetable entry deleted' });
  } catch (error) {
    console.error('Delete timetable error:', error);
    next(error);
  }
};

module.exports = {
  getTimetable,
  getTimetableEntry,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
};