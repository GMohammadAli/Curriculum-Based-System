const express = require('express')
const Article = require('./../models/article')
const path = require("path")
const router = express.Router()
const app = express()

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname, "/public")));

router.get('/new', (req, res) => {
  res.render('./articles/new', { article: new Article() , user: req.user})
})

router.get('/edit/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)
  res.render('./articles/edit', { article: article , user: req.user  })
})

router.get('/:slug', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug })
  if (article == null) res.redirect('/')
  res.render('articles/show', { article: article ,user: req.user })
})

router.post('/', async (req, res, next) => {
  req.article = new Article()
  next()
}, saveArticleAndRedirect('new'))

router.put('/:id', async (req, res, next) => {
  req.article = await Article.findById(req.params.id)
  next()
  console.log('running edit')
}, saveArticleAndRedirect('edit'))

router.delete('/:id', async (req, res) => {
  await Article.findByIdAndDelete(req.params.id)
  res.redirect('/articles')
})

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article
    article.title = req.body.title
    article.description = req.body.description
    article.markdown = req.body.markdown
    try {
      article = await article.save()
      console.log(`${article.slug}`)
      res.redirect(`/articles/${article.slug}`)
      console.log('--------------X-----------')
    } catch (e) {
      console.log(e)
      res.render(`./articles/${path}`, { article: article , user: req.user })
    }
  }
}

module.exports = router