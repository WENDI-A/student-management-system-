const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
router.use(authMiddleware.protect);
router.use(authMiddleware.authorize('admin'));
router.get('/profile/:id', adminController.getAdminById);
router.patch('/update/:id', adminController.updateAdmin);
router.put('/update/:id', adminController.updateAdmin);

module.exports = router;