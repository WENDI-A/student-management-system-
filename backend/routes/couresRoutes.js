const express = require('express');
const router = express.Router();
const courseController = require('../controllers/couresController');
const authMiddleware = require('../middleware/authMiddleware');
// Course routes
router.use(authMiddleware.protect)
router.post('/', authMiddleware.authorize("admin"),courseController.setCourse);
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.put('/:id', authMiddleware.authorize("admin"), courseController.updateCourse);
router.delete('/:id', courseController.permanentlyDeleteCourse);

module.exports = router;
