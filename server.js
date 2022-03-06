require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("./middlewares/auth");

const app = express();

const initializePassport = require("./passport-config");
initializePassport(
  passport,
  async (email) => {
    const userFound = await User.findOne({ email });
    return userFound;
  },
  async (id) => {
    const userFound = await User.findOne({ _id: id });
    return userFound;
  }
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,'/views'))
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,'/public')));

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index", { name: req.user.name });
});


app.get("/home", checkAuthenticated, (req, res) => {
  res.render("home", { name: req.user.name });
});

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register");
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login");
});

app.get("/notes", checkAuthenticated, (req, res) => {
  res.render("notes", { name: req.user.name });
});

app.get("/about", checkAuthenticated, (req, res) => {
  res.render("about", { name: req.user.name });
});

app.get("/links", checkAuthenticated, (req, res) => {
  res.render("links", { name: req.user.name });
});

app.get("/contact", checkAuthenticated, (req, res) => {
  res.render("contact", { name: req.user.name });
});

app.get("/syllabus", checkAuthenticated, (req, res) => {
  res.render("syllabus", { name: req.user.name });
});

app.get("/blog", checkAuthenticated, (req, res) => {
  res.render("blog", { name: req.user.name });
});

app.get("/events", checkAuthenticated, (req, res) => {
  res.render("events", { name: req.user.name });
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.post("/register", checkNotAuthenticated, async (req, res) => {
  const userFound = await User.findOne({ email: req.body.email });

  if (userFound) {
    req.flash("error", "User with that email already exists");
    res.redirect("/register");
  } else {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });

      await user.save();
      res.redirect("/login");
    } catch (error) {
      console.log(error);
      res.redirect("/register");
    }
  }
});

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

mongoose
  .connect("mongodb://localhost:27017/auth", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on Port 3000");
    });
  });
