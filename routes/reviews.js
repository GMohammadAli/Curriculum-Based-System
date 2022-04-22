const express = require("express");
const router = express.Router({ mergeParams: true });
const { isReviewAuthor } = require("./../middlewares/isAuthor");
const Article = require("./../models/article");
const Review = require("./../models/review");

router.post("/", async (req, res) => {
  console.log(req.params.id)
  const article = await Article.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  article.reviews.push(review);
  await review.save();
  await article.save();
   console.log("In Review Post Route");
  console.log(article)
  req.flash("success", "Created new review!");
  res.redirect(`/articles/${article.slug}`);
});

router.delete("/:reviewId", isReviewAuthor, async (req, res) => {
  const { id, reviewId } = req.params;
  const article = await Article.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted review");
  res.redirect(`/articles/${article.slug}`);
});

module.exports = router;
