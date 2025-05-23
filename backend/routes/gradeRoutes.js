const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all grade routes
router.use(authMiddleware.protect);

// Get all grades (paginated) - only for directors
router.get('/', authMiddleware.authorize('director'), gradeController.getAllGrades);

// Get grade by ID - only for directors
router.get('/:id', authMiddleware.authorize('director'), gradeController.getGradeById);

// Update grade - only for directors
router.put('/:id', authMiddleware.authorize('director'), gradeController.updateGrade);

// Get grades by student ID - only for directors
router.get('/student/:studentId', authMiddleware.authorize('director'), gradeController.getGradesByStudentId);

// Get grade summaries by student ID - only for directors
router.get('/summaries/student/:studentId', authMiddleware.authorize('director'), gradeController.getGradeSummariesByStudentId);

// Recalculate grade summaries for a student - only for directors
router.post('/summaries/recalculate/:studentId', authMiddleware.authorize('director'), gradeController.recalculateGradeSummaries);

module.exports = router;
