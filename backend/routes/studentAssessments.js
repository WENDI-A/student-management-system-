const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authMiddleware');
const {getStudentAssessmentsWithGrades} = require('../controllers/StudentAssessmentController');

router.use(authenticateJWT.protect);
router.get('/student/:courseId', authenticateJWT.authorize("student"), getStudentAssessmentsWithGrades);
router.get('/student', authenticateJWT.authorize("student"), getStudentAssessmentsWithGrades);

module.exports = router;
