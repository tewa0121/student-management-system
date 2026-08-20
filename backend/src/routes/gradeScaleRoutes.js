const express = require('express');
const { getGradeScale, updateGradeScale, addGrade, deleteGrade } = require('../controllers/gradeScaleController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', authorize('settings.view'), getGradeScale);
router.put('/:id', authorize('settings.update'), updateGradeScale);
router.post('/', authorize('settings.update'), addGrade);
router.delete('/:id', authorize('settings.update'), deleteGrade);

module.exports = router;