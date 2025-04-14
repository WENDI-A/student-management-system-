const express = require('express');
const router = express.Router();
const GradeController = require('../controllers/GradeController');
const authenticateJWT = require('../middleware/authMiddleware');
const { route } = require('./authRoutes');

router.use(authenticateJWT.protect);
router.get('/courses', authenticateJWT.authorize("teacher"), GradeController.getPublishedAssessmentsAndGrades);
router.post('/', authenticateJWT.authorize("teacher"), GradeController.setStudentGrade);
router.get('/:id', authenticateJWT.authorize("teacher"), GradeController.getStudentGrades);
router.put('/:id', authenticateJWT.authorize("teacher"), GradeController.updateStudentGrade);
router.get('/set-grade/:id', authenticateJWT.authorize("teacher"), GradeController.getGradeById);




module.exports = router;