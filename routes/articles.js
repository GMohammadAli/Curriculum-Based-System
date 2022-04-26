const express = require('express')
const articles = require("./../controllers/articles");
const router = express.Router()
const { isAuthorOfArticle } = require("./../middlewares/isAuthor");
const reviewsRouter = require("./../routes/reviews");
const { checkAuthenticated } = require('../middlewares/auth');

router.get('/new', articles.renderNewForm)

router.get("/edit/:id", isAuthorOfArticle , articles.renderEditForm)

router.use("/:id/reviews", checkAuthenticated, reviewsRouter);

router.get('/:slug', articles.showArticle)

router.post('/', articles.newArticle , saveArticleAndRedirect('new'))

router.route('/:id')
    .put(isAuthorOfArticle , articles.editArticle ,saveArticleAndRedirect("edit"))
    .delete( isAuthorOfArticle , articles.deleteArticle)

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