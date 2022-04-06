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

//Filter Route
router.get('/filter', async (req,res) => {
  console.log(req.body)
  console.log('filter route accessed')
  const _filterTo = 'course'
  const value = 'MCA'
  runFilter(_filterTo, value);
})

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


async function runFilter(_filterTo, value ) {
  try {
    await client.connect();
    const database = client.db("CBS");
    const collections = database.collection('notes');
    // query for filter method
    if( _filterTo == 'course'){
    const query = { 'course': `${value}` };
    console.log(query)
    const findResult = await collections.find(query).toArray();
    console.log("Found documents =>", findResult);
    console.log(findResult.length);
    }
  } finally {
    await client.close();
  }
}

module.exports = router;
