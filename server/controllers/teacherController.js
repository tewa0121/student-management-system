const db = require("../config/db");

// ====================================
// GET ALL TEACHERS
// ====================================

const getTeachers = (req, res) => {
  const sql = "SELECT * FROM teachers ORDER BY id DESC";

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

// ====================================
// ADD TEACHER
// ====================================

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
      hire_date,
      salary,
      address
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
// ===========================
// UPDATE TEACHER
// ===========================

const updateTeacher = (req, res) => {
  const { id } = req.params;

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
    address,
  } = req.body;

  const sql = `
    UPDATE teachers
    SET
      teacher_id=?,
      first_name=?,
      last_name=?,
      gender=?,
      email=?,
      phone=?,
      department=?,
      hire_date=?,
      salary=?,
      address=?
    WHERE id=?
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
        message: "Teacher Updated Successfully",
      });
    }
  );
};

module.exports = {
    getTeachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
};
// ==============================
// DELETE TEACHER
// ==============================

const deleteTeacher = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM teachers WHERE id=?";

  db.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json({
      success: true,
      message: "Teacher Deleted Successfully",
    });
  });
};

module.exports = {
  getTeachers,
  addTeacher,
  deleteTeacher,
  updateTeacher,
};
// ==============================
// UPDATE TEACHER
// ==============================

const updateTeacher = (req, res) => {
  const { id } = req.params;

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
    UPDATE teachers
    SET
      teacher_id=?,
      first_name=?,
      last_name=?,
      gender=?,
      email=?,
      phone=?,
      department=?,
      address=?
    WHERE id=?
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
        message: "Teacher Updated Successfully",
      });
    }
  );
};