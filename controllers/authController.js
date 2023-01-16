const { promisify } = require('util');
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

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting the token and check if it's there (token format: Bearer dfghdfghsfgh)
    //In postman, set the Headers as Key: Authorization, Value: Bearer dfghdfghsfgh
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2) Verify the token with jwt.verify and get the decoded payload
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(decoded);

    // 3) Check if the user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does not exist.', 401));
    }

    // 4) Check if the user changed password after the token was issued
    // if (currentUser.changedPasswordAfter) {
    //     return next(new AppError('User recently changed password. Please log in again.', 401));
    // }

    //Grant access to protected route, IMPORTANT TO STORE THE USER INFORMATION
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return(req, res, next) => {
        //roles: admin, lead-guide
        //THE USER INFORMATION IS IN req.user
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403))
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return next(new AppError('There is no user with email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false});

    // 3) Send it to user's email

});

exports.resetPassword = (req, res, next) => {

}