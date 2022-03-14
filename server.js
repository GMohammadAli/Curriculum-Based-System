require("dotenv").config();
const dotenv = require('dotenv');
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const Article = require("./models/article");
const articleRouter = require("./routes/articles");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const User = require("./models/User");
const Notes = require("./models/Note");
const notesRouter = require("./routes/notes");
const bcrypt = require("bcryptjs");
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("./middlewares/auth");

dotenv.config({path : './config.env'})

const DB = process.env.DATABASE;
const port = process.env.PORT;

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
app.use(express.static(path.join(__dirname, "/public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index", { name: req.user.name });
});

app.get("/home", checkAuthenticated, (req, res) => {
  res.render("index", { name: req.user.name });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login");
});

app.get("/notes", checkAuthenticated, async (req, res) => {
  const notes = await Notes.find().sort({
    createdAt: "desc",
  }); /* Sorted In Descending Order*/
  console.log("Notes Object created!");
  res.render("notes/index", { notes: notes, name: req.user.name });
});

app.get("/Sem1", checkAuthenticated, (req, res) => {
  res.render("Sem1", { name: req.user.name });
});

app.get("/Sem2", checkAuthenticated, (req, res) => {
  res.render("Sem2", { name: req.user.name });
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

app.get("/articles", checkAuthenticated, async (req, res) => {
  const articles = await Article.find().sort({ createdAt: "desc" });
  res.render("articles/index", { articles: articles, name: req.user.name });
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
    res.redirect("/login");
  } else {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });

      await user.save();
      req.flash("error", "Please Sign In Again!");
      res.redirect("/login");
    } catch (error) {
      console.log(error);
      res.redirect("/login");
    }
  }
});

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

app.use("/articles", articleRouter);
app.use("/notes", notesRouter);


mongoose
  .connect(DB , {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on Port ${port}`);
    });
  });
