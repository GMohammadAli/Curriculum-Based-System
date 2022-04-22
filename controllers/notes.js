const Note = require("./../models/Note");
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

module.exports.renderNewForm = (req, res) => {
  res.render("./notes/new", {
    note: new Note(),
    semesters,
    years,
    branches,
    courses,
  });
}

module.exports.createNewNote = async (req, res) => {
  console.log(req.body);
  const note = new Note(req.body.note);
  note.author = req.user._id;
  await note.save();
  req.flash("success", "Successfully made a new note!");
  res.redirect("/notes");
};

module.exports.renderEditForm = async (req, res) => {
  const note = await Note.findById(req.params.id);
  res.render("./notes/edit", {
    note: note,
    semesters,
    years,
    branches,
    courses,
  });
};

module.exports.runFilterRoute = async (req, res, next) => {
  console.log("filter route accessed");
  console.log(req.params)
  const { filter , value  } = req.params;
  console.log(filter + " in post route");
  console.log(value);
  req.notes = await runFilter(filter, value);
  next();
};

module.exports.showFilter = async (req, res) => {
  res.render("notes/index", {
    notes: req.notes,
    page: "filter"
  });
};

module.exports.updateNote = async (req, res) => {
  console.log(req.body);
  const { id } = req.params;
  const note = await Note.findByIdAndUpdate(id, { ...req.body.note });
  await note.save();
  req.flash("success", "Successfully updated the note!");
  res.redirect(`/notes`);
};

module.exports.deleteNote = async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  req.flash("success", "Successfully deleted the note!");
  res.redirect("/notes");
};

async function runFilter(_filter, value) {
  await client.connect();
  const database = client.db("CBS");
  const collections = database.collection("notes");
  // query for filter method
  console.log(_filter + " in filter funtion");
  if (_filter === "course") {
    const query = { course: `${value}` };
    const notes = await collections.find(query);
    const notesArray = await notes
      .map(function (note) {
        return note;
      })
      .toArray();
    console.log(notesArray);
    return notesArray;
  } else if (_filter === "semester") {
    const query = { semester: `${value}` };
    const notes = await collections.find(query);
    const notesArray = await notes
      .map(function (note) {
        return note;
      })
      .toArray();
    console.log(notesArray);
    return notesArray;
  } else if (_filter === "year") {
    const query = { year: `${value}` };
    const notes = await collections.find(query);
    const notesArray = await notes
      .map(function (note) {
        return note;
      })
      .toArray();
    console.log(notesArray);
    return notesArray;
  } else if (_filter === "branch") {
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
