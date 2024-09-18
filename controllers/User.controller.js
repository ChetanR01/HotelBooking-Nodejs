const User = require("../models").User;

const bcrypt = require("bcrypt");
const Op = require("sequelize").Op;

const JWT = require("jsonwebtoken");
const JWTConfig = require("../config/jwt-config");

const { sequelize } = require("../models");


// Route fun to create a lead
exports.createUser = async(req, res) => {
    try {
        let phone_no = req.body.phone_no;
        let name = req.body.name;
        let email = req.body.email;
        let password = bcrypt.hashSync(req.body.password, 10);

        const user = await User.findOne({
            where: {
                phone_no: phone_no,
            },
        });

        if (user) {
            return res.status(500).json({
                status: 0,
                message: "User already exists with this Phone No",
            });
        }

        // Check UserOtp
        const verifiedUser = await UserOTP.findOne({
            where: {
                phone_no: phone_no,
                verificationStatus: "1",
            },
        });

        if (!verifiedUser) {
            return res.status(401).json({
                status: 0,
                message: "Phone_no not verified, Please Verify Phone_no first",
            });
        }

        // Phone No is verified, now create User account
        const newUser = await User.create({
            name: name,
            phone_no: phone_no,
            email: email,
            password: password,
        });

        // Create UserProfile
        await UserProfile.create({
            phone_no: phone_no,
            name: name,
            email: email,
        });

        // Create Database for this user
        let userMap = await createDB.createDatabase({
            userId: newUser.id,
        });

        if (userMap == "Not Available") {
            console.log("ISSUE! = Failed to attach userMap");
        } else {
            await User.update({ userMap: userMap }, {
                where: {
                    id: newUser.id,
                },
            });

            // Create tables
            await createTables(userMap);
        }

        res.status(200).json({
            status: 1,
            message: "User created successfully",
        });
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
    let userType;
    User.findOne({
            where: {
                [Op.and]: [{ phone_no: req.body.phone_no }, { status: "1" }],
            },
        })
        .then((user) => {
            if (user) {
                if (bcrypt.compareSync(req.body.password, user.password)) {
                    // password matched
                    // console.log(user)
                    var userType = user.parent_id ? 'Employee' : 'Admin';
                    let userToken = JWT.sign({
                            id: user.id,
                            phone_no: user.phone_no,
                            userMap: user.userMap,
                            userRole_id: user.userRole_id,
                            userType: userType
                        },
                        JWTConfig.secret, {
                            expiresIn: JWTConfig.expiresIn,
                            notBefore: JWTConfig.notBefore,
                            algorithm: JWTConfig.algorithm,
                            issuer: JWTConfig.issuer,
                            audience: JWTConfig.audience,
                        }
                    );
                    const currentTimeInMillis = Date.now();
                    const ISTOffset = 5.5 * 60 * 60 * 1000; // IST = UTC + 5.30
                    User.update({
                        lastLogin: user.currentLogin,
                        currentLogin: new Date(currentTimeInMillis + ISTOffset),
                        loginCount: sequelize.literal('loginCount + 1')
                    }, {
                        where: {
                            id: user.id
                        }
                    })

                    // Call Profile % calculator function 
                    calcProfilePercentage(user).then((percentage) => {
                        // cal premium status function from above this Endpoint call
                        checkStatusByUserId(user.id).then((status) => {
                            var premium_type;
                            if (status == 'active') {
                                premium_type = 'Premium User';
                            } else {
                                premium_type = 'Free User';
                            }

                            res.status(200).json({
                                status: 1,
                                message: "User Logged In successfully!",
                                token: userToken,
                                premium_type: premium_type,
                                userType: userType,
                                profile_percentage: percentage // profile percentage 
                            });
                        });


                    });

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
                    message: "Use don't exist with this phone no",
                });
            }
        })
        .catch((err) => {
            console.log(err);
        });
};

