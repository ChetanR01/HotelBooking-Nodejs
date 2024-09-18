const express = require("express");
const router = express.Router();
const Sequelize = require('sequelize');
const Op = require('sequelize').Op // For OR in where condition
const User = require('../models/User')
const JwtMiddleware = require("../config/jwt-middleware");


const bodyParser = require('body-parser');
const UserController = require('../controllers/User.controller')

router.use(bodyParser.json());

// Create User 
router.post("/signup", UserController.createUser)
    // Create User 
router.post("/login", UserController.userLogin)



// // User Profile Routes
// router.get("/myprofile", JwtMiddleware.checkToken, UserProfileRoute.viewProfile)
// router.post("/updateprofile", JwtMiddleware.checkToken, UserProfileRoute.updateProfile)
// router.post("/update-user-avatar", JwtMiddleware.checkToken, uploadAvatar.single('avatar'), resizeAvatar, UserProfileRoute.uploadUserAvatar)
// router.get("/profile-percentage", JwtMiddleware.checkToken, UserProfileRoute.calcProfilePercentage)
// router.post("/reset-password", jwtMiddleware.checkToken, UserController.resetPassword);

// // OTP verification
// router.post("/send-otp", OTPVerificationRoute.SendOTP);
// router.post("/verify-sms-otp", OTPVerificationRoute.VerifySMSOTP);
// router.post("/send-email-otp", JwtMiddleware.checkToken, OTPVerificationRoute.SendMailOTP);
// router.post("/verify-email-otp", JwtMiddleware.checkToken, OTPVerificationRoute.VerifyMailOTP);




// Home page route
router.get("/", (req, res) => {
    res.status(200).json({
        status: 1,
        message: "Welcome to home page!!"
    });
});

module.exports = router;
