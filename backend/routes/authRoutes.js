const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const authMiddleware = require('../middleware/authMiddleware');
const auth = require("../controllers/UpdatePassword")


router.post('/login', loginController.login);
router.post('/forgot-password', loginController.forgotPassword);
router.post('/reset-password/:token', loginController.resetPassword);
router.get("/token-refresh/:token" ,loginController.token_refresh)
router.put('/update-password',  authMiddleware.protect, auth.updatePassword);
  

module.exports = router;