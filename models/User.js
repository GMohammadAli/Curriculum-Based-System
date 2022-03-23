const mongoose = require("mongoose");
const slugify = require('slugify')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
  },
  date_of_Birth : {
    type: Date
  },
  location : {
    type: String
  },
  phone : {
    type: Number
  },
  organization : {
    type: String
  },
  slug: {
    type: String,
    required: true,
    unique: true
  }
});

userSchema.pre('validate', function(next) {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true })
  }
  next()
})

module.exports = mongoose.model("User", userSchema)

