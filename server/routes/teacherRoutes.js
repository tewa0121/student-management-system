
const express = require("express");

const router = express.Router();

const {
  getTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
} = require("../controllers/teacherController");

// GET ALL TEACHERS
router.get("/", getTeachers);

// ADD TEACHER
router.post("/", addTeacher);

// UPDATE TEACHER
router.put("/:id", updateTeacher);

// DELETE TEACHER
router.delete("/:id", deleteTeacher);

module.exports = router;

