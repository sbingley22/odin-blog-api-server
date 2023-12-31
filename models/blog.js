const mongoose = require("mongoose")
const Schema = mongoose.Schema
const { DateTime } = require("luxon")

const BlogSchema = new Schema({
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  content: { type: String }
})

BlogSchema.virtual("url").get(function () {
  // Don't use arrow function as we need the this object
  return `/blogs/${this._id}`
})

BlogSchema.virtual("date_formatted").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED)
})

module.exports = mongoose.model("Blog", BlogSchema)