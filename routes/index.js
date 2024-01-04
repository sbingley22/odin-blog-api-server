var express = require('express');
var router = express.Router();

const Blog = require('../models/blog')
const Comment = require('../models/comment')

const { body, validationResult } = require("express-validator");
//const asyncHandler = require("express-async-handler");

router.get('/', function(req, res, next) {
  res.redirect("blogs")
});

router.get('/blogs/:blogid', async (req, res, next) => {
  const blogid = req.params.blogid
  const blog = await Blog.findById(blogid).exec()

  if (!blog) return res.status(404).json({ error: 'Blog not found' })
  const blogVirtual = blog.toJSON({virtuals: true})

  const comments = await Comment.find({ blog: blogid })
  const commentsVirtual = comments.map(comment => comment.toJSON({virtuals: true}))

  const responseData = {
    blog: blogVirtual,
    comments: commentsVirtual
  }

  res.json(responseData)
})

router.post('/blogs/:blogid', [
  // Validate and sanitize fields
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("comment", "Comment must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Comment object with escaped and trimmed data.
    const comment = new Comment({
      blog: req.params.blogid,
      name: req.body.name,
      content: req.body.comment,
      date: Date.now(),
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      console.log("comment invalid")
      console.log(errors.array())
      return res.status(400).json({ error: "Validation failed", details: errors.array() });
    }

    // Data from form is valid. Save comment.
    try {
      await comment.save();
      res.status(201).json({ message: "Comment saved successfully" });
    } catch (err) {
      // Handle other errors
      console.error('Error saving comment:', err);
      res.status(500).json({ error: "Internal server error" });
    }    
  }
])

router.get('/blogs', async (req, res, next) => {
  const blogs = await Blog.find({ published: true }).exec()
  res.json(blogs.map(blog => blog.toJSON({ virtuals: true })));
})

module.exports = router;
