const express = require("express");
const router = express.Router();
const courses = require('./../controllers/courses')
const { isAuthorOfCourse } = require("./../middlewares/isAuthor");
const multer = require("multer");
const { storage, cloudinary } = require("./../cloudinary");
const upload = multer({ storage });


router.route('/new')
    .get( courses.renderNewForm )
    .post( upload.array('image') , courses.createCourse )

router.get("/edit/:id", isAuthorOfCourse , courses.renderEditForm )

router.route("/filter/:filter/:value")
  .get(courses.runFilterRoute) 

router.route('/:id')
    .put( isAuthorOfCourse, courses.updateCourse )
    .delete( isAuthorOfCourse, courses.deleteCourse )

module.exports = router