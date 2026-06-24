
const express = require("express");
const router = express.Router();

const {
  getTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
} = require("../controllers/teacherController");
const upload = require("../middlewares/upload");

// GET ALL TEACHERS
router.get("/", getTeachers);

// ADD TEACHER
router.post(
  "/",
  upload.single("photo"),
  addTeacher
);

// UPDATE TEACHER
router.put(
  "/:id",
  upload.single("photo"),
  updateTeacher
);

// DELETE TEACHER
router.delete("/:id", deleteTeacher);

module.exports = router;

