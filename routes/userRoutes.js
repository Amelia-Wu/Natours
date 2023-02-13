const express = require("express");
const multer = require("multer");
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

//Upload images into a file system and in the database we put a link to the image
const upload = multer({ dest: 'public/img/users' })

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
//Upload a single image in this route
router.patch('/updateMe', upload.single('photo'), userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router
    .route('/')
    .get(userController.getAllUsers)

router
    .route('/:id')
    .get(userController.getUser)
    .delete(userController.deleteUser)

module.exports = router;