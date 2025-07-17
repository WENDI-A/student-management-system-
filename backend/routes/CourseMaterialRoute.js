const express = require('express');
const router = express.Router();
const courseMaterialController = require('../controllers/CourseMaterialController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.protect)
router.post('/', authMiddleware.authorize('admin', 'teacher'), courseMaterialController.addCourseMaterial);
router.get('/student',  courseMaterialController.getCourseMaterials);
router.post('/download', courseMaterialController.downloadMaterial); // New download endpoint
router.get('/:id',  courseMaterialController.getCourseMaterialsById);
router.put('/courses/:courseId/materials/:materialId', authMiddleware.authorize('admin', 'teacher'), courseMaterialController.editCourseMaterial);
router.get('/', authMiddleware.authorize('admin', 'teacher'), courseMaterialController.getAllMaterialsByTeacher);
router.delete('/:materialId', authMiddleware.authorize('admin', 'teacher'), courseMaterialController.deleteMaterial);

module.exports = router;
