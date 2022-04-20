const express = require("express");
const path = require("path");
const Note = require("./../models/Note");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const router = express.Router();
const app = express();
const semesters = [
  "SEM I",
  "SEM II",
  "SEM III",
  "SEM IV",
  "SEM V",
  "SEM VI",
  "SEM VII",
  "SEM VIII",
];
const years = ["FE", "SE", "TE", "BE"];
const branches = ["COMPS", "IT", "EXTC", "ETRX", "INST"];
const courses = ["MCA", "B.Tech"];

const { MongoClient } = require("mongodb");
const url = process.env.DATABASE;
const client = new MongoClient(url);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());

router.get("/new", (req, res) => {
  res.render("./notes/new", {
    note: new Note(),
    user: req.user,
    semesters,
    years,
    branches,
    courses,
  });
});

router.post("/new", async (req, res) => {
  console.log(req.body);
  const note = new Note(req.body.note);
  await note.save();
  res.redirect("/notes");
});

router.get("/edit/:id", async (req, res) => {
  const note = await Note.findById(req.params.id);
  res.render("./notes/edit", {
    note: note,
    user: req.user,
    semesters,
    years,
    branches,
    courses,
  });
});

//Filter Routes
router.post('/filter', async (req,res,next) => {
  console.log(req.body)
  console.log('filter route accessed')
  const _filter = Object.keys(req.body.filter)[0];
  const value = Object.values(req.body.filter)[0];
  console.log(_filter + ' in post route');
  console.log(value);
  req.notes = await runFilter(_filter, value);
  next()
})

router.all('/filter',async(req,res) => {
  res.render("notes/index", {
    notes: req.notes,
    user: req.user,
    page: "filter"
  });
})

router.get("/:slug", async (req, res) => {
  const note = await Note.findOne({ slug: req.params.slug });
  if (note == null) res.redirect("/");
  res.render("notes/show", { note: note, user: req.user });
});

router.put("/:id", async (req, res) => {
  console.log(req.body);
  const { id } = req.params;
  const note = await Note.findByIdAndUpdate(id, { ...req.body.note });
  await note.save();
  res.redirect(`/notes/${note.slug}`);
});

router.delete("/:id", async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.redirect("/notes");
});

//Also check the individual options for the notes
async function runFilter( _filter, value ) {
    await client.connect();
    const database = client.db("CBS");
    const collections = database.collection('notes');
    // query for filter method
    console.log(_filter + " in filter funtion");
    if (_filter == "course") {
      const query = { course: `${value}` };
      const notes = await collections.find(query); 
      const notesArray = await notes.map( function(note) { return note } ).toArray();
      console.log(notesArray);
      return notesArray;
    } else if (_filter == "semester") {
      const query = { semester: `${value}` };
      const notes = await collections.find(query);
      const notesArray = await notes
        .map(function (note) {
          return note;
        })
        .toArray();
      console.log(notesArray);
      return notesArray;
    } else if (_filter == "year") {
      const query = { year: `${value}` };
      const notes = await collections.find(query);
      const notesArray = await notes
        .map(function (note) {
          return note;
        })
        .toArray();
      console.log(notesArray);
      return notesArray;
    } else if (_filter == "branch") {
      const query = { branch: `${value}` };
      const notes = await collections.find(query);
      const notesArray = await notes
        .map(function (note) {
          return note;
        })
        .toArray();
      console.log(notesArray);
      return notesArray;
    }
}

module.exports = router;
