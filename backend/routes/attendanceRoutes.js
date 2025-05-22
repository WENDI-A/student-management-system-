
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.protect);
router.use(authMiddleware.authorize("teacher" ,"director"));

router.get('/current-week', attendanceController.getCurrentWeekAttendance);
router.post('/set-attendance', attendanceController.setAttendance);
router.get('/by-week', attendanceController.getAttendanceByWeek);

module.exports = router;
