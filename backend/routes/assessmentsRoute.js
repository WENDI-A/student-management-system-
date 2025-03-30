const express = require('express');
const router = express.Router();
const AssessmentController = require('../controllers/AssessmentController');
const authenticateJWT = require('../middleware/authMiddleware');

router.use(authenticateJWT.protect);
router.get('/teacher', authenticateJWT.authorize("teacher"), AssessmentController.getTeacherAssessments);
router.get('/courses', authenticateJWT.authorize("admin", "teacher"), AssessmentController.getCourseAssessments);
router.post('/courses', authenticateJWT.authorize("admin", "teacher"), AssessmentController.createAssessment);
router.put('/:assessmentId', authenticateJWT.authorize("admin", "teacher"), AssessmentController.updateAssessment);
router.get('/:id', authenticateJWT.authorize("admin", "teacher"), AssessmentController.getOneAssessment);
router.delete('/:assessmentId', authenticateJWT.authorize("admin", "teacher"), AssessmentController.deleteAssessment);

module.exports = router;
