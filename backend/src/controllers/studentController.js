const Student = require('../models/Student');

// Get all students with pagination, search, filters
const getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const classFilter = req.query.class || '';
    const sectionFilter = req.query.section || '';
    const statusFilter = req.query.status || '';

    const students = await Student.findAll(page, limit, {
      search,
      class: classFilter,
      section: sectionFilter,
      status: statusFilter
    });

    const total = await Student.countAll({
      search,
      class: classFilter,
      section: sectionFilter,
      status: statusFilter
    });

    res.json({
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a single student
const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    next(error);
  }
};

// Create a new student
const createStudent = async (req, res, next) => {
  try {
    const data = req.body;

    // Check for duplicate studentId or admissionNo
    if (data.studentId) {
      const existing = await Student.findByStudentId(data.studentId);
      if (existing) {
        return res.status(400).json({ message: 'Student ID already exists' });
      }
    }
    if (data.admissionNo) {
      const existing = await Student.findByAdmissionNo(data.admissionNo);
      if (existing) {
        return res.status(400).json({ message: 'Admission number already exists' });
      }
    }

    const studentId = await Student.create(data);
    const newStudent = await Student.findById(studentId);
    res.status(201).json({ message: 'Student created successfully', student: newStudent });
  } catch (error) {
    next(error);
  }
};

// Update a student
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check duplicate studentId if changed
    if (data.studentId && data.studentId !== student.studentId) {
      const existing = await Student.findByStudentId(data.studentId);
      if (existing) {
        return res.status(400).json({ message: 'Student ID already exists' });
      }
    }
    if (data.admissionNo && data.admissionNo !== student.admissionNo) {
      const existing = await Student.findByAdmissionNo(data.admissionNo);
      if (existing) {
        return res.status(400).json({ message: 'Admission number already exists' });
      }
    }

    const updated = await Student.update(id, data);
    if (!updated) {
      return res.status(400).json({ message: 'No changes made' });
    }

    const updatedStudent = await Student.findById(id);
    res.json({ message: 'Student updated successfully', student: updatedStudent });
  } catch (error) {
    next(error);
  }
};

// Delete a student
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Student.delete(id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get all unique classes (for filters)
const getClasses = async (req, res, next) => {
  try {
    const classes = await Student.getClasses();
    res.json(classes);
  } catch (error) {
    next(error);
  }
};

// Get all unique sections (for filters)
const getSections = async (req, res, next) => {
  try {
    const sections = await Student.getSections();
    res.json(sections);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getClasses,
  getSections
};