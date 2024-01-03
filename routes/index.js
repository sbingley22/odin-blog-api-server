var express = require('express');
var router = express.Router();

const Blog = require('../models/blog')
const Comment = require('../models/comment')

router.get('/', function(req, res, next) {
  res.redirect("blogs")
});

router.get('/blogs/:blogid', async (req, res, next) => {
  console.log("Route: /blogs/:blogid")
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

router.get('/blogs', async (req, res, next) => {
  console.log("Route: /blogs")
  const blogs = await Blog.find().exec()
  res.json(blogs.map(blog => blog.toJSON({ virtuals: true })));
})

module.exports = router;
