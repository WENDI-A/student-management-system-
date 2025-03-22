const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');


router.post('/login', loginController.login);

// router.post('/forgot-password', userController.forgotPassword);
// router.post('/reset-password/:token', userController.resetPassword);

module.exports = router;


// {
//     "firstName" : "kaleb",
//       "lastName" : "adm",
//      "email" : "email.com" ,
//       "password" :  "12345", 
//       "phone" : "02992929", 
//       "address" : "aa",
//       "organization" :"haww",
//       "purpose" : "tour",
//       "visitDuration" : "wow"
// }