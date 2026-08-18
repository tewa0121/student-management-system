const express = require('express');
const {
  getTimetable,
  getTimetableEntry,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
} = require('../controllers/timetableController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('academics.view'), getTimetable);
router.get('/:id', authorize('academics.view'), getTimetableEntry);
router.post('/', authorize('academics.create'), createTimetableEntry);
router.put('/:id', authorize('academics.update'), updateTimetableEntry);
router.delete('/:id', authorize('academics.delete'), deleteTimetableEntry);

module.exports = router;