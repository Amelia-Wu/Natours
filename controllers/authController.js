const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.signup = catchAsync(async(req, res, next) => {
    //do not simply use req.body because the users can add the role as admin
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    //use the payload and the secret, and the option
    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
});

exports.login = catchAsync(async (req, res, next) => {
    //define the email and the password in this method (get them from req.body)
    const {email, password} = req.body;

    //Check if the email and the password exist
    if(!email || !password) {
        return next(new AppError('Please provide email and password.', 404))
    }

    //Check if the email and the password are correct
    // use '+' because password was not selected in the first place
    const user = await User.findOne({email}).select('+password');
    // const correct = await user.correctPassword(password, user.password);

    //If the user or password is incorrect return the unauthorized error(401)
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password.', 401))
    }

    //If everything is ok, send the token to the client
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    })
});