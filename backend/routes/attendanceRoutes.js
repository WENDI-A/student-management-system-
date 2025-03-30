const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authenticate = require('../middleware/authMiddleware');

router.use(authenticate.protect);
router.use(authenticate.authorize("teacher"));
router.get('/', attendanceController.getAttendanceByTeacherCourse);
router.get('/weekday', attendanceController.getAttendanceByWeekday);
router.post('/attendance', attendanceController.markAttendance);
router.post('/attendance/bulk', attendanceController.bulkMarkAttendance);

module.exports = router;