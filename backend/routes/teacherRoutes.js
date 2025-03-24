const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/register', teacherController.registerTeacher);
router.use(authMiddleware.protect);
router.get('/profile/:id', authMiddleware.authorize('admin', 'teacher'), teacherController.getTeacherById);
router.patch('/update/:id', authMiddleware.authorize('admin', 'teacher'), teacherController.updateTeacher);
router.put('/update/:id', authMiddleware.authorize('admin', 'teacher'), teacherController.updateTeacher);
router.get('/', authMiddleware.authorize('admin'), teacherController.getAllTeachers);

module.exports = router;