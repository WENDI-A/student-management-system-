const express = require('express');
const router = express.Router();
const courseEnrollments = require('../controllers/CourseEnrollmentController');
const authMiddleware = require('../middleware/authMiddleware');
// Course routes
router.use(authMiddleware.protect)
router.get('/', authMiddleware.authorize('admin', 'teacher'), courseEnrollments.getPendingStudentsByCourse);

module.exports = router;
