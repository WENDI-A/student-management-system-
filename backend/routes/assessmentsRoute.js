const express = require('express');
const router = express.Router();
const AssessmentController = require('../controllers/AssessmentController');
const authenticateJWT = require('../middleware/authMiddleware');
const {getStudentAssessmentsWithGrades} = require('../controllers/StudentAssessmentController');

router.use(authenticateJWT.protect);
router.get('/teacher', authenticateJWT.authorize("teacher", "director"), AssessmentController.getTeacherAssessments);
router.get('/courses', authenticateJWT.authorize("admin", "teacher", "director"), AssessmentController.getCourseAssessments);
router.post('/courses', authenticateJWT.authorize("admin", "teacher", "director"), AssessmentController.createAssessment);

// only to get the student assessments
router.get('/student/:courseId', authenticateJWT.authorize("student" , "director"), getStudentAssessmentsWithGrades);
router.get('/student', authenticateJWT.authorize("student" , "director"), getStudentAssessmentsWithGrades);


router.put('/:assessmentId', authenticateJWT.authorize("admin", "teacher", "director"), AssessmentController.updateAssessment);
router.get('/:id', authenticateJWT.authorize("admin", "teacher", "director"), AssessmentController.getOneAssessment);
router.delete('/:assessmentId', authenticateJWT.authorize("admin", "teacher", "director"), AssessmentController.deleteAssessment);

module.exports = router;
