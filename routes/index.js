var express = require('express');
var router = express.Router();

const Blog = require('../models/blog')

router.get('/', function(req, res, next) {
  res.redirect("blogs")
});

router.get('/blogs', async (req, res, next) => {
  const blogs = await Blog.find().exec()
  res.send(blogs)
})

module.exports = router;
