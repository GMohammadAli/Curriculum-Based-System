if(process.env.NODE_ENV !== 'production'){
require("dotenv").config()
}


const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")
const User = require("./models/User")
const Notes = require("./models/Note")
const Course = require('./models/Course')
const Article = require("./models/article");
const articleRouter = require("./routes/articles");
const notesRouter = require("./routes/notes")
const coursesRouter = require("./routes/courses")
const ejsMate = require("ejs-mate")
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require('helmet');
const MongoDBStore = require("connect-mongo")(session);
const bcrypt = require("bcryptjs")
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("./middlewares/auth")
const domain = [
  "Web Development",
  "Artificial Intelligence",
  "Machine Learning",
  "Game Development",
  "Cloud Computing",
];

const DB = process.env.DATABASE
const port = process.env.PORT
const secret = process.env.SESSION_SECRET

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

const store = new MongoDBStore({
  url: DB,
  secret,
  touchAfter: 24 * 60 * 60
})

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store,
  name: 'session',
  //a default name to connect.sid
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: true ,
    // says that the cookie can be configured only when used through https request
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
} 



app.use(flash())
app.use(session(sessionConfig))
app.use(helmet())

// const scriptSrcUrls = [
//   "https://stackpath.bootstrapcdn.com/",
//   "https://kit.fontawesome.com/",
//   "https://cdnjs.cloudflare.com/",
//   "https://cdn.jsdelivr.net",
//   "https://bootswatch.com"
// ];
// const styleSrcUrls = [
//   "https://kit-free.fontawesome.com/",
//   "https://stackpath.bootstrapcdn.com/",
//   "https://use.fontawesome.com/",
//   "https://cdnjs.cloudflare.com/ajax",
//   "https://bootswatch.com",
//   "https://fonts.googleapis.com",
//   "https://use.fontawesome.com/releases",
// ];
// const connectSrcUrls = [
//   "https://api.mapbox.com/",
//   "https://a.tiles.mapbox.com/",
//   "https://b.tiles.mapbox.com/",
//   "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [
//   "https://fonts.googleapis.com/css",
//   "https://fonts.googleapis.com/css2"
// ];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      // connectSrc: ["'self'", ...connectSrcUrls],
      // scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      // styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      // workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        // "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dzeilpbmo/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      // fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "/public")))

//For protection against Mongo Injection Attacks
app.use(mongoSanitize({
    replaceWith: "_",
}))


app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});


app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index")
})

app.get("/home", checkAuthenticated, (req, res) => {
  res.render("home")
})

app.get("/about", checkAuthenticated, (req, res) => {
  res.render("about")
})

app.get("/contact", checkAuthenticated, (req, res) => {
  res.render("contact")
})

app.get("/links", checkAuthenticated, (req, res) => {
  res.render("links");
});

app.get('/courses',checkAuthenticated , async (req,res) => {
  const courses = await Course.find().sort({ createdAt: "desc" });
  console.log("Courses Route Accessed!");
  res.render("courses/index", {
    courses: courses,
    domain: domain,
    page: "index",
   });
})

app.get("/articles", checkAuthenticated, async (req, res) => {
  const articles = await Article.find().sort({ createdAt: "desc" })
  console.log("Articles Route Accessed!")
  res.render("articles/index", { articles: articles})
})

app.get("/notes", checkAuthenticated, async (req, res) => {
  const notes = await Notes.find().sort({
    createdAt: "desc",
  });
  console.log("Notes Route Accessed!");
  res.render("notes/index", { notes: notes, page:'index' });
});


app.get("/events", checkAuthenticated, (req, res) => {
  res.render("events/index");
});

app.get("/event1", checkAuthenticated, (req, res) => {
  res.render("events/event1");
});
app.get("/event2", checkAuthenticated, (req, res) => {
  res.render("events/event2");
});
app.get("/event3", checkAuthenticated, (req, res) => {
  res.render("events/event3");
});
app.get("/event4", checkAuthenticated, (req, res) => {
  res.render("events/event4");
});
app.get("/event5", checkAuthenticated, (req, res) => {
  res.render("events/event5");
});
app.get("/event6", checkAuthenticated, (req, res) => {
  res.render("events/event6");
});
app.get("/event7", checkAuthenticated, (req, res) => {
  res.render("events/event7");
});

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
    res.redirect("/login")
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
  res.render("users/editProfile")
})

app.get("/profile", checkAuthenticated, async (req, res) => {
  res.render("users/profile")
})

app.put(
  "/update/:id",
  async (req, res) => {  
  const { id } = req.params;
  console.log(req.body);
  const user = await User.findByIdAndUpdate(id, {
    ...req.body.user,
  },{ runValidators:true });
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

app.use("/articles", checkAuthenticated, articleRouter);
app.use("/notes", checkAuthenticated,  notesRouter);
app.use("/courses", checkAuthenticated, coursesRouter);

//Error Template ,If no routes are matched
app.all('*',(req,res) => {
  res.render("error")
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
      console.log(`Database Connected`);
    })
  })
  .catch((err) => {
    console.log("Mongo DB Connnection Error!!")
    console.log(err)
  })  
