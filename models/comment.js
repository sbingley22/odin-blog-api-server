const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { DateTime } = require("luxon")

const CommentSchema = new Schema({
  blog: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
  name: { type: String, required: true, maxLength: 20 },
  date: { type: Date, default: Date.now },
  content: { type: String, required: true, maxLength: 100 }
})

CommentSchema.virtual("url").get(function () {
  return `/blogs/${this.blog}/comments/${this._id}`
})

CommentSchema.virtual("date_formatted").get(function() {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED)
})

module.exports = mongoose.model("Comment", CommentSchema)