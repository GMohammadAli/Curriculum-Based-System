const mongoose = require("mongoose")
const marked = require('marked')
const { Schema } = mongoose
const slugify = require('slugify')
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)

const notesSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  subject: {
    type: String
  },
  semester: {
    type: String,
    enum: [
      "SEM I",
      "SEM II",
      "SEM III",
      "SEM IV",
      "SEM V",
      "SEM VI",
      "SEM VII",
      "SEM VIII",
    ],
    required: true,
  },
  year: {
    type: String,
    enum: ['FE','SE','TE','BE'],
    required: true,
  },
  branch: {
    type: String,
    enum: ['COMPS','IT','EXTC','ETRX','INST'],
    required: true,
  },
  course: {
    type: String,
    enum: ['MCA','B.Tech'],
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  url: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  sanitizedHtml: {
    type: String,
    required: true,
  },
});

notesSchema.pre('validate', function(next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true })
  }
  if (this.subject) {
    this.sanitizedHtml = dompurify.sanitize(marked.parse(this.subject))
  }


  next()
})

module.exports = mongoose.model("Note", notesSchema)
 