const db = require("../config/db");

// =========================
// GET ALL TEACHERS
// =========================

const getTeachers = (req, res) => {
  const sql = "SELECT * FROM teachers";

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

// =========================
// ADD TEACHER
// =========================

const addTeacher = (req, res) => {
  const {
    teacher_id,
    first_name,
    last_name,
    gender,
    email,
    phone,
    department,
    hire_date,
    salary,
  } = req.body;

  const sql = `
    INSERT INTO teachers
    (
      teacher_id,
      first_name,
      last_name,
      gender,
      email,
      phone,
      department,
      hire_date,
      salary
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      teacher_id,
      first_name,
      last_name,
      gender,
      email,
      phone,
      department,
      hire_date,
      salary,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({
        success: true,
        message: "Teacher Added Successfully",
      });
    }
  );
};

module.exports = {
  getTeachers,
  addTeacher,
};