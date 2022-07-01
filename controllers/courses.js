const Course = require("./../models/Course");
const multer = require("multer");
const { storage, cloudinary } = require("./../cloudinary");
const upload = multer({ storage });

const platforms = ["UDEMY", "COURSERA", "NPTEL", "UDACITY", "YOUTUBE"];
const prices = ["Paid", "Free"];
const domains = [
  "Web Development",
  "Artificial Intelligence",
  "Machine Learning",
  "Game Development",
  "Cloud Computing",
];

const { MongoClient } = require("mongodb");
const { query } = require("express");
const url = process.env.DATABASE;
const client = new MongoClient(url);

module.exports.renderNewForm = async (req, res) => {
  res.render("./courses/new", {
    Course: new Course(),
    platforms,
    prices,
    domains,
  });
}

module.exports.createCourse = async (req, res) => {
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
};

module.exports.renderEditForm = async (req, res) => {
  const course = await Course.findById(req.params.id);
  res.render("./courses/edit", {
    course: course,
    platforms,
    prices,
    domains,
  });
}

module.exports.runFilterRoute = async (req, res) => {
  console.log(req.params);
  console.log("filter route accessed");
  const { filter, value } = req.params;
  console.log(filter + " in post route");
  console.log(value);
  const query = await getQuery(filter,value) 
  console.log(query+"in post route")
  req.courses = await getCourses(query);
  res.render("courses/index", {
    courses: req.courses,
    page: "filter",
    domain: domains
  });
}

module.exports.updateCourse = async (req, res) => {
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
  req.flash("success", "Successfully updated the course!");
  res.redirect(`/courses`);
}

module.exports.deleteCourse = async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  req.flash("success", "Successfully deleted the course!");
  res.redirect("/courses");
}

async function getQuery(_filter, value) {
  console.log(_filter + " in filter funtion");
  if (_filter === "domain") {
    return query = { domain: `${value}` };
  } else if (_filter === "price") {
    return query = { price: `${value}` };
  } else if (_filter === "platform") {
    return query = { platform: `${value}` }; 
  }
  //return query
}

async function getCourses(query){
  await client.connect();
  const database = client.db("CBS");
  const collections = database.collection("courses");
  console.log(query+ "in getCourses")
  const courses = await collections.find(query);
  const coursesArray = await courses
    .map(function (course) {
      return course;
    })
    .toArray();
  console.log(coursesArray);
  return coursesArray;
}