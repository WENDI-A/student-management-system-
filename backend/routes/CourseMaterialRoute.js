const express = require('express');
const router = express.Router();
const courseMaterialController = require('../controllers/CourseMaterialController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.protect)
router.post('/',authMiddleware.authorize("admin","teacher"), courseMaterialController.addCourseMaterial);
router.get('/:id', courseMaterialController.getCourseMaterials);
router.put('/courses/:courseId/materials/:materialId', authMiddleware.authorize("teacher"), courseMaterialController.editCourseMaterial);
router.get('/', authMiddleware.authorize("teacher"), courseMaterialController.getAllMaterialsByTeacher);
router.delete('/:materialId', authMiddleware.authorize("teacher"), courseMaterialController.deleteMaterial);

module.exports = router;
