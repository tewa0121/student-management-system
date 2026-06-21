const db = require("../config/db");

// ==========================
// GET ALL TEACHERS
// ==========================
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

// ==========================
// ADD NEW TEACHER
// ==========================
const addTeacher = (req, res) => {
  const {
    teacher_id,
    first_name,
    last_name,
    gender,
    email,
    phone,
    department,
    address,
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
      address
    )
    VALUES (?,?,?,?,?,?,?,?)
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
        message: "Teacher Added Successfully",
        teacherId: result.insertId,
      });
    }
  );
};

module.exports = {
  getTeachers,
  addTeacher,
};