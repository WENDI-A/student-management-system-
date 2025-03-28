const express = require('express');
const router = express.Router();
const AssessmentController = require('../controllers/AssessmentController');
const authenticateJWT  = require('../middleware/authMiddleware');

router.use(authenticateJWT.protect);
router.get('/courses/:courseId/assessments', authenticateJWT.authorize("admin"),AssessmentController.getCourseAssessments);
router.get('/assessments/:assessmentId', authenticateJWT.authorize("admin"), AssessmentController.getAssessment);
router.post('/courses/:courseId/assessments', authenticateJWT.authorize("admin"),AssessmentController.createAssessment);
router.put('/assessments/:assessmentId', authenticateJWT.authorize("admin"), AssessmentController.updateAssessment);
router.delete('/assessments/:assessmentId', authenticateJWT.authorize("admin"), AssessmentController.deleteAssessment);

module.exports = router;