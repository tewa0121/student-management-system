const express = require("express");

const router = express.Router();

const {
  getTeachers,
  addTeacher,
  deleteTeacher,
  updateTeacher,
} = require("../controllers/teacherController");
router.put("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);



// GET ALL
router.get("/", getTeachers);

// ADD NEW
router.post("/", addTeacher);

module.exports = router;