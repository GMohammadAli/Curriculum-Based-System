const Article = require("./../models/article");

module.exports.renderNewForm = (req, res) => {
  res.render("./articles/new", { article: new Article() });
};

module.exports.renderEditForm = async (req, res) => {
  const article = await Article.findById(req.params.id);
  res.render("./articles/edit", { article: article });
};

module.exports.showArticle = async (req, res) => {
  console.log("Article Show Route");
  const article = await Article.findOne({ slug: req.params.slug })
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  console.log(article);
  if (!article) {
    req.flash("error", "Cannot find that article!");
    return res.redirect("/articles");
  }
  res.render("articles/show", { article });
};

module.exports.deleteArticle = async (req, res) => {
  await Article.findByIdAndDelete(req.params.id);
  res.redirect("/articles");
};

module.exports.editArticle = async (req, res, next) => {
  req.article = await Article.findById(req.params.id);
  next();
  // console.log("running edit");
};

module.exports.newArticle = async (req, res, next) => {
  req.article = new Article();
  next();
};
