const express = require("express");
const router = express.Router({ mergeParams: true });
const { isReviewAuthor } = require("./../middlewares/isAuthor");
const reviews = require('./../controllers/reviews')

router.post("/",  reviews.createReview )

router.delete("/:reviewId", isReviewAuthor, reviews.deleteReview )

module.exports = router;
