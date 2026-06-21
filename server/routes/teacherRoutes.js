const express = require("express");

const router = express.Router();

const {
  getTeachers,
  addTeacher,
} = require("../controllers/teacherController");

// GET all teachers
router.get("/", getTeachers);

// ADD new teacher
router.post("/", addTeacher);

module.exports = router;