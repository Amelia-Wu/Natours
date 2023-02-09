const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

//Merge the parameters so that tourId can be accessed
const router = express.Router({ mergeParams: true });

//Restriction: only users can write reviews
router.route('/')
    .get(reviewController.getAllReviews)
    .post(authController.protect, authController.restrictTo('user'), reviewController.createReview);

router.route('/:id').delete(reviewController.deleteReview);

module.exports = router;

