const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/register', parentController.registerParent);
router.get('/', authMiddleware.authorize('admin'), parentController.getAllParents);
router.get('/children/:id', authMiddleware.authorize('admin', 'parent'), parentController.getChildrenByParentId);
router.get('/:id', authMiddleware.authorize('admin', 'parent'), parentController.getParentById);
router.put('/update/:id', authMiddleware.authorize('admin', 'parent'), parentController.updateParent);
router.delete('/:id', authMiddleware.authorize('admin'), parentController.deleteParent);

module.exports = router;
