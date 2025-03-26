const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const teacherRoutes = require('./teacherRoutes');
const parentRoutes = require('./parentRoutes');
const adminRoutes = require('./adminRoutes');
const guestRoutes = require('./guestRoutes');
const dashbord = require('./dashbordRoute')

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/parents', parentRoutes);
router.use('/admins', adminRoutes);
router.use('/guests', guestRoutes);
router.use("/dashboard" , dashbord)

module.exports = router;