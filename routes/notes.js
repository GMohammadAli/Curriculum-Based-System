const express = require('express')
const methodOverride = require("method-override")
const path = require("path")
const Note = require('./../models/Note')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const router = express.Router()
const app = express()

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,'views'))

router.get('/new', (req, res) => {
    res.render('./notes/new', { note: new Note() , name: req.user.name })
  })
  
  router.get('/edit/:id', async (req, res) => {
    const note = await Note.findById(req.params.id)
    res.render('./notes/edit', { note: note , name: req.user.name  })
  })
  
  router.get('/:slug', async (req, res) => {
    const note = await Note.findOne({ slug: req.params.slug })
    if (note == null) res.redirect('/')
    res.render('notes/show', { note: note , name: req.user.name  })
  })
  
  router.post('/', async (req, res, next) => {
    req.note = new Note()
    next()
    console.log('running')
  }, saveNoteAndRedirect('new'))
  
  router.put('/:id', async (req, res, next) => {
    req.note = await Note.findById(req.params.id)
    next()
    console.log('running edit')
  }, saveNoteAndRedirect('edit'))
  
  router.delete('/:id', async (req, res) => {
    await Note.findByIdAndDelete(req.params.id)
    res.redirect('/notes')
  })
  
  function saveNoteAndRedirect(path) {
    return async (req, res) => {
      console.log(req.note);
     let note = req.note
     note.title = req.body.title
     note.description = req.body.description
     note.subject = req.body.subject
     note.semester = req.body.semester
     note.url = req.body.url
      try {
        note = await note.save()
        console.log('function called')
        console.log(`${note.slug}`)
        res.redirect(`/notes/${note.slug}`)
        console.log('--------------X--------------')
      } catch (e) {
        // console.log(e)
        res.render(`./notes/${path}`, { note: note , name: req.user.name })
      }
    }
  }
module.exports = router