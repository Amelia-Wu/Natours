const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');

exports.signup = catchAsync(async(req, res, next) => {
    //do not simply use req.body because the users can add the role as admin
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    //use the payload and the secret, and the option
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
});