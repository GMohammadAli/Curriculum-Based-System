const express = require("express");
const Course = require('./../models/Course')
const router = express.Router();
const { isAuthorOfCourse } = require("./../middlewares/isAuthor");
const multer = require("multer");
const { storage, cloudinary } = require("./../cloudinary");
const upload = multer({ storage });

const platforms = ["UDEMY", "COURSERA", "NPTEL", "UDACITY", "YOUTUBE"];
const prices = ["Paid", "Free"]
const domains = ["Web Development", "Artificial Intelligence", "Machine Learning", "Game Development", "Cloud Computing"];

router.get('/new', async(req,res) => {
    res.render('./courses/new', { Course : new Course() , platforms , prices , domains })
})

router.post("/new", upload.array('image') , async (req, res) => {
    console.log(req.body);
    const course = new Course(req.body.course);
    course.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
    }));
    course.author = req.user._id;
    await course.save();
    console.log(course);
    req.flash("success", "Successfully made a new course!");
    res.redirect(`/courses`);
});

router.get("/edit/:id", isAuthorOfCourse , async (req, res) => {
  const course = await Course.findById(req.params.id);
  res.render("./courses/edit", {
    course: course,
    platforms,
    prices,
    domains
  });
});

//Filter Routes

router.put("/:id", isAuthorOfCourse, async (req, res) => {
  console.log(req.body);
  const { id } = req.params;
  const course = await Course.findByIdAndUpdate(id, { ...req.body.course });
//   const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
//   course.images.push(...imgs);
//   if (req.body.deleteImages) {
//     for (let filename of req.body.deleteImages) {
//       await cloudinary.uploader.destroy(filename);
//     }
//     await campground.updateOne({
//       $pull: { images: { filename: { $in: req.body.deleteImages } } },
//     });
//   }
  await course.save();
  res.redirect(`/courses`);
});

router.delete("/:id", isAuthorOfCourse, async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.redirect("/courses");
});


module.exports = router