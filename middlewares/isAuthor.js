const Note = require('./../models/Note')
const Article = require('./../models/article')
const Course = require("./../models/Course");
const Review = require("./../models/review");


module.exports.isAuthorOfNote = async (req, res, next) => {
  const { id } = req.params;
  const note = await Note.findById(id);
  if (!note.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/notes`);
  }
  next();
};

module.exports.isAuthorOfArticle = async (req, res, next) => {
  const { id } = req.params;
  const article = await Article.findById(id);
  if (!article.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/articles`);
  }
  next();
};

module.exports.isAuthorOfCourse = async (req, res, next) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/courses`);
  }
  next();
};


module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  console.log(review)
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/articles/${id}`);
  }
  next();
};

