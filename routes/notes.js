const express = require("express");
const router = express.Router();
const { isAuthorOfNote } = require('./../middlewares/isAuthor');
const notes = require('./../controllers/notes')
const { checkAuthenticated } = require("./../middlewares/auth");

router.route('/new')
    .get(notes.renderNewForm )
    .post(notes.createNewNote)

router.get("/edit/:id", isAuthorOfNote , notes.renderEditForm )

router.route('/filter/:filter/:value')
    .get(notes.runFilterRoute )

router.route('/:id')
    .put( isAuthorOfNote , notes.updateNote )
    .delete(isAuthorOfNote , notes.deleteNote )


module.exports = router;
