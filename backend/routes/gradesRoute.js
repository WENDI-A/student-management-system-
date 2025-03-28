const express = require('express');
const router = express.Router();
const GradeController = require('../controllers/GradeController');
const authenticateJWT = require('../middleware/authMiddleware');

router.use(authenticateJWT.protect);
router.get('/courses/:courseId/grades', authenticateJWT.authorize("teacher"), GradeController.getCourseGrades);
router.get('/courses/:courseId/students/:studentId/grades',authenticateJWT.authorize("teacher"), GradeController.getStudentCourseGrades);
router.post('/courses/:courseId/students/:studentId/assessments/:assessmentId/grade', 
  authenticateJWT.authorize("teacher"), 
  GradeController.createOrUpdateGrade
);
router.put('/courses/:courseId/assessments/:assessmentId/publish', 
  authenticateJWT.authorize("teacher"), 
  GradeController.publishAssessmentGrades
);

router.post('/courses/:courseId/calculate-final-grades', 
  authenticateJWT.authorize("teacher"), 
  GradeController.calculateFinalGrades
);

module.exports = router;