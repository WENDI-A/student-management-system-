const express = require('express');
const router = express.Router();
const AssessmentController = require('../controllers/AssessmentController');
const authenticateJWT = require('../middleware/authMiddleware');
const {getStudentAssessmentsWithGrades} = require('../controllers/StudentAssessmentController');

router.use(authenticateJWT.protect);
router.get('/teacher', authenticateJWT.authorize("teacher"), AssessmentController.getTeacherAssessments);
router.get('/courses', authenticateJWT.authorize("admin", "teacher"), AssessmentController.getCourseAssessments);
router.post('/courses', authenticateJWT.authorize("admin", "teacher"), AssessmentController.createAssessment);

// only to get the student assessments
router.get('/student/:courseId', authenticateJWT.authorize("student"), getStudentAssessmentsWithGrades);
router.get('/student', authenticateJWT.authorize("student"), getStudentAssessmentsWithGrades);


router.put('/:assessmentId', authenticateJWT.authorize("admin", "teacher"), AssessmentController.updateAssessment);
router.get('/:id', authenticateJWT.authorize("admin", "teacher"), AssessmentController.getOneAssessment);
router.delete('/:assessmentId', authenticateJWT.authorize("admin", "teacher"), AssessmentController.deleteAssessment);

module.exports = router;
