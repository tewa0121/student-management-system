const express = require("express");

const router = express.Router();

const {
    getStudents,
    addStudent
} = require("../controllers/studentController");

console.log("✅ studentRoutes.js Loaded");

router.get("/", getStudents);
router.post("/", addStudent);

module.exports = router;