const mongoose = require("mongoose")
const marked = require('marked')
const slugify = require('slugify')
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)

const notesSchema = new mongoose.Schema({
 title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
 semester: {
    type: String,
    required: true
  },
  createdOn: {
      type: Date,
      default: Date.now
  },
  description: {
      type: String,
      required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  sanitizedHtml: {
    type: String,
    required: true
  }
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
 