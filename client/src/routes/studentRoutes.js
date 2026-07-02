const express = require("express");

const router = express.Router();

const {
getStudents,
addStudent,
} = require("../controllers/studentController");

// ===========================
// GET ALL STUDENTS
// ===========================

router.get("/", getStudents);

// ===========================
// ADD STUDENT
// ===========================

router.post("/", addStudent);

module.exports = router;
