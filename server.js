require("dotenv").config();
const dotenv = require("dotenv");
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
const ejsMate = require("ejs-mate");
const bcrypt = require("bcryptjs");
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("./middlewares/auth");

dotenv.config({ path: "./config.env" });

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

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index", { user: req.user });
});

app.get("/home", checkAuthenticated, (req, res) => {
  res.render("home", { user: req.user });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login");
});

app.get("/notes", checkAuthenticated, async (req, res) => {
  const notes = await Notes.find().sort({
    createdAt: "desc",
  });
  console.log("Notes Object created!");
  res.render("notes/index", { notes: notes, user: req.user });
});

app.get("/about", checkAuthenticated, (req, res) => {
  res.render("about", { user: req.user });
});

app.get("/links", checkAuthenticated, (req, res) => {
  res.render("links", { user: req.user });
});

app.get("/contact", checkAuthenticated, (req, res) => {
  res.render("contact", { user: req.user });
});

app.get("/articles", checkAuthenticated, async (req, res) => {
  const articles = await Article.find().sort({ createdAt: "desc" });
  console.log("Articles Object created!");
  res.render("articles/index", { articles: articles, user: req.user });
});

app.get("/events", checkAuthenticated, (req, res) => {
  res.render("events", { user: req.user });
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/home",
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

// Editing Users
app.get("/profile", checkAuthenticated, async (req, res) => {
  res.render("editProfile", { user: req.user });
});

app.get("/profile1", checkAuthenticated, async (req, res) => {
  res.render("profile", { user: req.user });
});

app.put(
  "/update/:id",
  async (req, res, next) => {
    console.log(req.body + " In Put")
    req.user = await User.findById(req.params.id)
    next()
    console.log(`${req.body}`)
  },
  saveUserAndRedirect()
);

function saveUserAndRedirect() {
  return async (req, res) => {
    console.log(req.user + " In Function");
    let user = req.user;
    user.name = req.body.name;
    user.email = req.body.email;
    user.gender = req.body.gender;
    user.date_of_Birth = req.body.date_of_Birth;
    user.city = req.body.city;
    user.state = req.body.state;
    user.year = req.body.year;
    user.specialization = req.body.specialization;
    try {
      await user.save();
      console.log(`${user.slug} in function`);
      res.render(`profile`, { user: req.user });
      console.log("--------------X-----------");
    } catch (e) {
      console.log(e);
      res.send(`Couldn't Update User Details `+ e );
    }
  };
}

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

app.use("/articles", articleRouter);
app.use("/notes", notesRouter);

//Error Template ,If no routes are matched
app.use((req,res) => {
  res.render("error",{ user : req.user });
})

mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on Port ${port}`);
    })
  })
  .catch((err) => {
    console.log("Mongo DB Connnection Error!!");
    console.log(err);
  })  
