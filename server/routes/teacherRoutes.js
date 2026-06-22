const express = require("express");

const router = express.Router();

const {
  getTeachers,
  addTeacher,
} = require("../controllers/teacherController");

// GET ALL
router.get("/", getTeachers);

// ADD NEW
router.post("/", addTeacher);

module.exports = router;