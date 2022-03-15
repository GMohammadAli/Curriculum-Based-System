const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
  },
  date_of_Birth : {
    type: String,
  },
  city : {
    type: String,
  },
  state : {
    type: String,
  },
  year : {
    type: String,
  },
  specialization : {
    type: String,
  }
});

module.exports = mongoose.model("User", userSchema)

