const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const { authorize } = require('../middleware/authMiddleware');


router.get('/', authorize('admin'), guestController.getAllGuests);
router.post('/register', guestController.registerGuest);
router.put('/update/:id', authorize('admin'), guestController.updateGuest);
router.delete('/delete/:id', authorize('admin'), guestController.deleteGuest);

module.exports = router;
