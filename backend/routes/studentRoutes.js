const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', studentController.registerStudent);
router.use(authMiddleware.protect);
router.get('/profile/:id', authMiddleware.authorize('admin', 'student'), studentController.getStudentById);
router.put('/update/:id', authMiddleware.authorize('admin', 'student'), studentController.updateStudent);
router.get('/', authMiddleware.authorize('admin',"teacher"), studentController.getAllStudents);
router.delete('/:id', authMiddleware.authorize('admin'), studentController.deleteStudent);

module.exports = router;