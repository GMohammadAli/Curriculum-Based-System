const express = require("express");
const router = express.Router();
const courses = require('./../controllers/courses')
const { isAuthorOfCourse } = require("./../middlewares/isAuthor");
const multer = require("multer");
const { storage, cloudinary } = require("./../cloudinary");
const upload = multer({ storage });
const { checkAuthenticated } = require("./../middlewares/auth");


router
  .route("/new")
  .get(checkAuthenticated, courses.renderNewForm)
  .post(checkAuthenticated, upload.array("image"), courses.createCourse);

router.get(
  "/edit/:id",
  checkAuthenticated,
  isAuthorOfCourse,
  courses.renderEditForm
);

router.route("/filter/:filter/:value")
  .get(courses.runFilterRoute) 

router
  .route("/:id")
  .put(checkAuthenticated, isAuthorOfCourse, courses.updateCourse)
  .delete(checkAuthenticated, isAuthorOfCourse, courses.deleteCourse);

module.exports = router