const mongoose = require("mongoose");
const marked = require("marked");
const { Schema } = mongoose;
const slugify = require("slugify");
const createDomPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const dompurify = createDomPurify(new JSDOM().window);

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const courseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  images: [ImageSchema],
  link: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    enum: [
      "Web Development",
      "Artificial Intelligence",
      "Machine Learning",
      "Game Development",
      "Cloud Computing",
    ],
    required: true,
  },
  instructor_name: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  price: {
    type: String,
    enum: ["Paid", "Free"],
    required: true,
  },
  platform: {
    type: String,
    enum: ["UDEMY", "COURSERA", "NPTEL", "UDACITY", "YOUTUBE"],
    required: true,
  },
  technologies: {
    type: String,
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
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

courseSchema.pre("validate", function (next) {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  if (this.instructor_name) {
    this.sanitizedHtml = dompurify.sanitize(marked.parse(this.instructor_name));
  }

  next();
});

module.exports = mongoose.models.Course || mongoose.model("Course", courseSchema);
