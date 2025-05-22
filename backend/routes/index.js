const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const teacherRoutes = require('./teacherRoutes');
const parentRoutes = require('./parentRoutes');
const adminRoutes = require('./adminRoutes');
const guestRoutes = require('./guestRoutes');
const dashbord = require('./dashbordRoute')
const notifications = require('./notificationRoutes')
const coures = require('./couresRoutes')
const CourseMaterial = require('./CourseMaterialRoute')
const Assessment = require('./assessmentsRoute');
const Grade = require('./gradesRoute');
const attendanceRoutes = require('./attendanceRoutes');
const courseEnrollments = require('./courseEnrollmentsRoute')

const gradeRoutes = require('./gradeRoutes');

router.use('/directory/grade', gradeRoutes);
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/parents', parentRoutes);
router.use('/admins', adminRoutes);
router.use('/guests', guestRoutes);
router.use("/dashboard" , dashbord)
router.use("/notifications" , notifications)
router.use("/courses" ,coures )
router.use("/CourseMaterial" ,CourseMaterial )
router.use("/Assessment" , Assessment)
router.use("/grade", Grade)
router.use('/Attendance', attendanceRoutes);
router.use('/courseenrollments', courseEnrollments);
router.use("/schedules", require('./scheduleRoutes'))
router.use('/StudentcourseEnrollments', require('./studentAssessments'));
router.use('/directors', require('./director'));

module.exports = router;
