require("dotenv").config()
const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const passport = require("passport")
const Article = require("./models/article")
const articleRouter = require("./routes/articles")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")
const User = require("./models/User")
const Notes = require("./models/Note")
const notesRouter = require("./routes/notes")
const ejsMate = require("ejs-mate")
const bcrypt = require("bcryptjs")
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("./middlewares/auth")


const DB = process.env.DATABASE
const port = process.env.PORT

const app = express()

const initializePassport = require("./passport-config")
initializePassport(
  passport,
  async (email) => {
    const userFound = await User.findOne({ email })
    return userFound
  },
  async (id) => {
    const userFound = await User.findOne({ _id: id })
    return userFound
  }
)

app.use(express.urlencoded({ extended: true }))
app.use(flash())
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
)
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "/public")))

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index", { user: req.user })
})

app.get("/home", checkAuthenticated, (req, res) => {
  res.render("home", { user: req.user })
})

app.get("/notes", checkAuthenticated, async (req, res) => {
  const notes = await Notes.find().sort({
    createdAt: "desc",
  })
  console.log("Notes Object created!")
  res.render("notes/index", { notes: notes, user: req.user })
})

app.get("/about", checkAuthenticated, (req, res) => {
  res.render("about", { user: req.user })
})

app.get("/links", checkAuthenticated, (req, res) => {
  res.render("links", { user: req.user })
})

app.get("/contact", checkAuthenticated, (req, res) => {
  res.render("contact", { user: req.user })
})

app.get("/articles", checkAuthenticated, async (req, res) => {
  const articles = await Article.find().sort({ createdAt: "desc" })
  console.log("Articles Object created!")
  res.render("articles/index", { articles: articles, user: req.user })
})

app.get("/events", checkAuthenticated, (req, res) => {
  res.render("events", { user: req.user })
})

//User Auth 
app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("users/login")
})

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true,
  })
)

app.post("/register", checkNotAuthenticated, async (req, res) => {
  const userFound = await User.findOne({ email: req.body.email })

  if (userFound) {
    req.flash("error", "User with that email already exists")
    res.redirect("users/login")
  } else {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      })

      await user.save()
      req.flash("error", "Please Sign In Again!")
      res.redirect("/login")
    } catch (error) {
      console.log(error)
      res.redirect("/login")
    }
  }
})

app.get("/editProfile", checkAuthenticated, async (req, res) => {
  res.render("users/editProfile", { user: req.user })
})

app.get("/profile", checkAuthenticated, async (req, res) => {
  res.render("users/profile", { user: req.user })
})

app.put(
  "/update/:id",
  async (req, res) => {  
  const { id } = req.params;
  console.log(req.body);
  const user = await User.findByIdAndUpdate(id, {
    ...req.body.user,
  });
  await user.save();
  req.flash("success", "Successfully updated User Profile!");
  res.redirect(`/profile`);
  }
)

app.delete("/logout", (req, res) => {
  req.logout()
  res.redirect("/login")
})

//Users Auth ends here

app.use("/articles", articleRouter)
app.use("/notes", notesRouter)

//Error Template ,If no routes are matched
app.all('*',(req,res) => {
  res.render("error",{ user : req.user })
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
      console.log(`Server is running on Port ${port}`)
    })
  })
  .catch((err) => {
    console.log("Mongo DB Connnection Error!!")
    console.log(err)
  })  
