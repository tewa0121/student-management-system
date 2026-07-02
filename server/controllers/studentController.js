
const db = require("../config/db");

// =====================================
// GET ALL STUDENTS
// =====================================

const getStudents = (req, res) => {
  const sql = "SELECT * FROM students ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  });
};

// =====================================
// ADD STUDENT
// =====================================

const addStudent = (req, res) => {
  const {
    student_id,
    first_name,
    last_name,
    gender,
    email,
    phone,
    date_of_birth,
    department,
    year_level,
    address,
  } = req.body;

  const sql = `
    INSERT INTO students
    (
      student_id,
      first_name,
      last_name,
      gender,
      email,
      phone,
      date_of_birth,
      department,
      year_level,
      address
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      student_id,
      first_name,
      last_name,
      gender,
      email,
      phone,
      date_of_birth,
      department,
      year_level,
      address,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Student Added Successfully",
        studentId: result.insertId,
      });
    }
  );
};

// =====================================
// UPDATE STUDENT
// =====================================

const updateStudent = (req, res) => {
  const { id } = req.params;

  const {
    student_id,
    first_name,
    last_name,
    gender,
    email,
    phone,
    date_of_birth,
    department,
    year_level,
    address,
  } = req.body;

  const sql = `
    UPDATE students
    SET
      student_id=?,
      first_name=?,
      last_name=?,
      gender=?,
      email=?,
      phone=?,
      date_of_birth=?,
      department=?,
      year_level=?,
      address=?
    WHERE id=?
  `;

  db.query(
    sql,
    [
      student_id,
      first_name,
      last_name,
      gender,
      email,
      phone,
      date_of_birth,
      department,
      year_level,
      address,
      id,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({
        success: true,
        message: "Student Updated Successfully",
      });
    }
  );
};

// =====================================
// DELETE STUDENT
// =====================================

const deleteStudent = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM students WHERE id=?",
    [id],
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({
        success: true,
        message: "Student Deleted Successfully",
      });
    }
  );
};

// =====================================
// EXPORTS
// =====================================

module.exports = {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
};

