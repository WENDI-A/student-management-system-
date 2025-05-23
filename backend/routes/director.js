const express = require('express');
const router = express.Router();
const directorController = require('../controllers/directorController');
const authMiddleware = require('../middleware/authMiddleware');

// Create Director
router.post('/', authMiddleware.protect, authMiddleware.authorize('admin'), directorController.createDirector);

// Get all Directors
router.get('/', authMiddleware.protect, authMiddleware.authorize('admin'), directorController.getAllDirectors);

// Get Director by ID
router.get('/:id', authMiddleware.protect, authMiddleware.authorize('admin'), directorController.getDirectorsById);

// Update Director
router.put('/:id', authMiddleware.protect, authMiddleware.authorize('admin'), directorController.updateDirector);

// Delete Director
router.delete('/:id', authMiddleware.protect, authMiddleware.authorize('admin'), directorController.deleteDirector);

module.exports = router; 