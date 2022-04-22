const express = require('express')
const Article = require('./../models/article')
const Review = require("./../models/review");
const router = express.Router()
const { isAuthorOfArticle } = require("./../middlewares/isAuthor");
const reviewsRouter = require("./../routes/reviews");
const { checkAuthenticated } = require('../middlewares/auth');

router.get('/new', (req, res) => {
  res.render('./articles/new', { article: new Article()})
})

router.get("/edit/:id", isAuthorOfArticle , async (req, res) => {
  const article = await Article.findById(req.params.id);
  res.render("./articles/edit", { article: article });
});

router.use("/:id/reviews", checkAuthenticated, reviewsRouter);

router.get('/:slug', async (req, res) => {
  console.log("Article Show Route")
  const article = await Article.findOne({ slug: req.params.slug }).populate({
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
  // if (article == null) res.redirect('/')
  res.render('articles/show', { article })
})

router.post('/', async (req, res, next) => {
  req.article = new Article()
  next()
}, saveArticleAndRedirect('new'))

router.put(
  "/:id",
  isAuthorOfArticle ,
  async (req, res, next) => {
    req.article = await Article.findById(req.params.id);
    next();
    console.log("running edit");
  },
  saveArticleAndRedirect("edit")
);

router.delete("/:id", isAuthorOfArticle , async (req, res) => {
  await Article.findByIdAndDelete(req.params.id);
  res.redirect("/articles");
});

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article
    article.title = req.body.title
    article.description = req.body.description
    article.markdown = req.body.markdown
    try {
      article.author = req.user._id;
      article = await article.save()
      console.log(`${article.slug}`)
      res.redirect(`/articles/${article.slug}`)
      console.log('--------------X-----------')
    } catch (e) {
      console.log(e)
      res.render(`./articles/${path}`, { article: article })
    }
  }
}

module.exports = router