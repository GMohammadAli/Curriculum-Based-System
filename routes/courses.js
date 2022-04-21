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

const { MongoClient } = require("mongodb");
const url = process.env.DATABASE;
const client = new MongoClient(url);

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
router.post("/filter", async (req, res, next) => {
  console.log(req.body);
  console.log("filter route accessed");
  const _filter = Object.keys(req.body.filter)[0];
  const value = Object.values(req.body.filter)[0];
  console.log(_filter + " in post route");
  console.log(value);
  req.courses = await runFilter(_filter, value);
  next();
});

router.all("/filter", async (req, res) => {
  res.render("courses/index", {
    courses: req.courses,
    page: "filter",
    domain: domains
  });
});

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
})


async function runFilter( _filter, value ) {
  await client.connect();
  const database = client.db("CBS");
  const collections = database.collection("courses");
  // query for filter method
  console.log(_filter + " in filter funtion");
  if (_filter === "domain") {
    const query = { domain: `${value}` };
    const courses = await collections.find(query);
    const coursesArray = await courses
      .map(function (course) {
        return course;
      })
      .toArray();
    console.log(coursesArray);
    return coursesArray;
  } else if (_filter === "price") {
    const query = { price: `${value}` };
    const courses = await collections.find(query);
    const coursesArray = await courses
      .map(function (course) {
        return course;
      })
      .toArray();
    console.log(coursesArray);
    return coursesArray;
  } else if (_filter === "platform") {
    const query = { platform: `${value}` };
    const courses = await collections.find(query);
    const coursesArray = await courses
      .map(function (course) {
        return course;
      })
      .toArray();
    console.log(coursesArray);
    return coursesArray;
  }
}


module.exports = router