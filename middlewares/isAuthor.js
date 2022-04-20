const Note = require('./../models/Note')
const Article = require('./../models/article')


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

