const express = require("express");
const Course = require('./../models/Course')
const router = express.Router();
// const app = express();
const { isAuthorOfCourse } = require("./../middlewares/isAuthor");
const multer = require("multer");
const { storage } = require("./../cloudinary");
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

module.exports = router