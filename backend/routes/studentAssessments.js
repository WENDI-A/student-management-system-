const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authMiddleware');
const {getStudentAssessmentsWithGrades, getStudentAssessmentById} = require('../controllers/StudentAssessmentController');
const StudentAnswerController = require('../controllers/StudentAnswerController');

router.use(authenticateJWT.protect);
router.get('/student/:courseId', authenticateJWT.authorize("student"), getStudentAssessmentsWithGrades);
router.get('/student', authenticateJWT.authorize("student"), getStudentAssessmentsWithGrades);
router.get('/student/assessment/:assessmentId', authenticateJWT.authorize("student"), getStudentAssessmentById);
router.post('/student/submit-answers', authenticateJWT.authorize("student"), StudentAnswerController.submitAnswers);

module.exports = router;
