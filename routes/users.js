var express = require('express');
var router = express.Router();

const Blog = require('../models/blog')
const Comment = require('../models/comment')

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const User = require("../models/user")

// token authetication middlewear
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) {
    next()
    return
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

router.get('/', authenticateToken, function(req, res, next) {
  if (req.user != null) {
    res.send(`Welcome, ${req.user.username}!`);
  }
  else {
    res.send('Please login')
  }
});

router.get('/dashboard', authenticateToken, async function(req, res, next) {
  if (req.user != null) {
    // user is authenticated, send data
    const welcome = `Welcome, ${req.user.username}!`
    const blogs = await Blog.find().exec()

    return res.json({
      welcome,
      blogs,
    });
  }
  else {
    return res.status(400).json({ error: "Cannot authenticate token" });
  }
});

router.post('/dashboard/:blogid', authenticateToken, async function(req, res, next) {
  if (req.user != null) {
    // update the blog with blogid
    console.log(req.params.blogid)
    try {
      const updatedBlog = await Blog.findByIdAndUpdate(
        req.params.blogid,
        { published: req.body.published },
        { new: true }
      );
      res.json({ msg: "updated" });
    } catch (err) {
      res.status(404).send({ error: "Blog doesn't exist!" });
    }
  }
  else {
    return res.status(400).json({ error: "Cannot authenticate token" })
  }
})

router.get('/dashboard/:blogid/comments', authenticateToken, async function(req, res, next) {
  if (req.user != null) {
    // display all comments for the blog
    try {
      const comments = await Comment.find({blog: req.params.blogid}).exec()
      res.json(comments)
    } catch (err) {
      res.status(404).send({ error: "Blog doesn't exist!" });
    }
  }
  else {
    return res.status(400).json({ error: "Cannot authenticate token" })
  }
})

router.delete('/dashboard/:blogid/comments/:commentid', authenticateToken, async function(req, res, next) {
  if (req.user != null) {
    try {
      await Comment.findByIdAndDelete(req.params.commentid);
      res.json("comment deleted")
      return
    } catch (err) {
      res.status(404).send({ error: "Comment doesn't exist" })
    }
  } else {
    return res.status(400).json({ error: "Cannot authenticate token" })
  }
})

router.post('/newblog', authenticateToken, async function(req, res, next) {
  console.log("newblog route")
  if (req.user != null) {
    try {
      const blog = new Blog({
        title: req.body.title,
        date: Date.now(),
        content: req.body.content,
        published: false
      })

      console.log(blog)

      if (blog.title == '' || blog.content == ''){
        return res.status(400).json({ error: "Both title and content must not be empty" })
      }

      await blog.save()
      return res.json("Blog saved")

    } catch (err) {
      console.error('Error saving blog:', err);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(400).json({ error: "Cannot authenticate token" })
  }
})

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  console.log( username )
  try {
    const user = await User.findOne({username: username}).exec();
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ error: "Password incorrect" });
      }
      const accessToken = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET);
      res.json({ accessToken: accessToken });
    } else {
      return res.status(400).json({ error: "User incorrect" });
    }
  } catch (err) {
    console.log("Error finding user in database or comparing password", err)
    res.sendStatus(403)
  }
})

module.exports = router;
