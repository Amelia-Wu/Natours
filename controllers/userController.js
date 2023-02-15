const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require("multer");

//Store files to disk, destination: where the images to be stored, filename: user-id-timestamp
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users');
    },
    filename: (req, file, cb) => {
        const extension = file.mimetype.split('/'[1]);
        cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
    }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj
}

//Route Handlers
exports.getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find();

    //Send response
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
});

//The user can update its own data, except for tha password related
exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
       return(next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400)))
    }

    //Don't want to update everything in the body, only name and email
    const filteredBody = filterObj(req.body, 'name', 'email')
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false})

    res.status(204).json({
        state: 'success',
        data: null
    })
})

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route has not been defined yet!'
    })
}

exports.deleteUser = factory.deleteOne(User);