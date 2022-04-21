const express = require("express");
const path = require("path");
const Course = require('./../models/Course')
const router = express.Router();
// const app = express();
const { isAuthorOfCourse } = require("./../middlewares/isAuthor");

const platform = ["UDEMY", "COURSERA", "NPTEL", "UDACITY", "YOUTUBE"];
const price = ["Paid", "Free"]
const domain = ["Web Development", "Artificial Intelligence", "Machine Learning", "Game Development", "Cloud Computing"];

router.get('/new', async(req,res) => {
    res.render('./courses/new', { user : req.user, Course : new Course() , platform , price , domain })
})

module.exports = router