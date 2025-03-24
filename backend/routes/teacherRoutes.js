const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/register', teacherController.registerTeacher);
router.use(authMiddleware.protect);
router.get('/profile/:id', authMiddleware.authorize('admin', 'teacher'), teacherController.getTeacherById);
router.put('/update/:id', authMiddleware.authorize('admin', 'teacher'), teacherController.updateTeacher);
router.get('/', authMiddleware.authorize('admin'), teacherController.getAllTeachers);
router.delete('/:id', authMiddleware.authorize('admin'), teacherController.deleteTeacher);

module.exports = router;