const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');


router.post('/login', loginController.login);

router.post('/forgot-password', loginController.forgotPassword);
router.post('/reset-password/:token', loginController.resetPassword);
router.get("/token-refresh/:token" ,loginController.token_refresh)

module.exports = router;