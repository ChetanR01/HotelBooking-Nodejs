const User = require("../models").User;

const bcrypt = require("bcrypt");
const Op = require("sequelize").Op;

const JWT = require("jsonwebtoken");
const JWTConfig = require("../config/jwt-config");

const { sequelize } = require("../models");
const { sendOTPEmail } = require("../utils/sendEmailOTP");
const EmailOTP = require("../models").EmailOTP;


// Email verify
exports.sendEmailOTP = async(req, res) => {
    try{
        let email = req.body.email;

        // Send email otp
        EmailOTP.findOne({
            where:{
                [Op.and]: [{ email: email }, { status: 1 }],
            }
        }).then((verified)=>{
            if(verified){
                return res.status(200).json({
                    status:1,
                    message: 'Email is already verified'
                });
            }else{
                sendOTPEmail(email).then((otp)=>{
                    if(otp){
                        // search for existing unverified emails
                        EmailOTP.findOne({
                            where:{
                                email:email
                            }
                        }).then((rec)=>{
                            if(rec){
                                // email exists
                                EmailOTP.update(
                                    {
                                        otp:otp
                                    },
                                    {
                                        where: {
                                            email: email,
                                        },
                                    }
                                ).then((rec)=>{
                                    return res.status(200).json({
                                        status:1,
                                        message:'OTP sent successfully'
                                    })
                                }).catch((err)=>{
                                    return res.status(500).json({
                                        status:0,
                                        message:'Unable to send OTP',
                                        error:err
                                    })
                                })
                            }else{
                                EmailOTP.create({
                                    email: email,
                                    otp: otp
                                }).then((res)=>{
                                    return res.status(200),json({
                                        status:1,
                                        message:'OTP sent successfully'
                                    })
                                }).catch((err)=>{
                                    return res.status(500).json({
                                        status:0,
                                        message:'Something went wrong',
                                        error:err
                                    })
                                })
                            }
                        })
                    }else{
                        console.log("OTP not sent!");
                        return res.status(500).json({
                            status:0,
                            message:'Failed to send OTP'
                        })
                    }
                });
            }
        });
    }catch(error){
        console.log('Something went wrong..',error)
    }
}


// Email verify
exports.verifyEmail = async(req, res) => {
    try{
        let email = req.body.email;
        let OTP = req.body.otp;

        EmailOTP.findOne({
            where:{
                [Op.and]: [{ email: email }, { otp: OTP }],
            }
        }).then((verified)=>{
            if(verified){
                // OTP verified
                EmailOTP.update({
                    status:1
                }, {
                    where:{
                        email:email
                    }
                }).then((updated)=>{
                    return res.status(200).json({
                        status:1,
                        message:'OTP verified successfully'
                    })
                }).catch((err)=>{
                    return res.status(500).json({
                        status:0,
                        message:'Unable to verify OTP'
                    })
                })
            }else{
                return res.status(400).json({
                    status:0,
                    message:'Invalid OTP'
                })
            }
        })
    }catch(error){
        console.log('Something went wrong', error)
    }
}


exports.createUser = async(req, res) => {
    try {
        let mobile_no = req.body.mobile_no;
        let name = req.body.name;
        let email = req.body.email;
        let password = bcrypt.hashSync(req.body.password, 10);


        EmailOTP.findOne({
            [Op.and]: [{ email: email }, { status: 1 }],
        }).then((verified)=>{
            if(verified){
                // email is verified
                User.findOne({
                    where: {
                        [Op.and]: [{ email: email }, { status: 1 }],
                    },
                }).then((extUser)=>{
                    if(extUser){
                        return res.status(400).json({
                            status:0,
                            message:'User already registed with this email'
                        })
                    }else{
                        User.create({
                            name: name,
                            mobile_no: mobile_no,
                            email: email,
                            password: password,
                        }).then((newUser)=>{
                            if(newUser){
                                return res.status(200).json({
                                    status:1,
                                    message:'User created successfully'
                                })
                            }else{
                                return res.status(400).json({
                                    status:0,
                                    message:'Unble to create user'
                                })
                            }
                        }).catch((err)=>{
                            console.log('Something went wrong', err)
                        });
                    }
                }).catch((err)=>{
                    console.log("Something went wrong", err)
                });
            }else{
                return res.status(400),json({
                    status:0,
                    message:'Email is not verified'
                })
            }
        })
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            status: 0,
            message: "Unable to create User",
            error: error.message,
        });
    }
};

// User login
exports.userLogin = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({
            where: {
                [Op.and]: [{ email: email }, { status: 1 }],
            },
        })
        .then((user) => {
            if (user) {
                if (bcrypt.compareSync(password, user.password)) {
                    // password matched
                    // console.log(user)
                    let userToken = JWT.sign({
                            id: user.id,
                            mobile_no: user.mobile_no,
                            name: user.name,
                            email:req.body.email         
                        },
                        JWTConfig.secret, {
                            expiresIn: JWTConfig.expiresIn,
                            notBefore: JWTConfig.notBefore,
                            algorithm: JWTConfig.algorithm,
                            issuer: JWTConfig.issuer,
                            audience: JWTConfig.audience,
                        }
                    );

                    return res.status(200).json({
                        status:1,
                        message:'user logged in successfully',
                        token: userToken
                    })

                } else {
                    // incorrect pass
                    res.status(500).json({
                        status: 0,
                        message: "Incorrect Password!",
                    });
                }
            } else {
                // we dont have user data
                res.status(404).json({
                    status: 0,
                    message: "Use don't exist with this Email",
                });
            }
        })
        .catch((err) => {
            console.log(err);
        });
};

