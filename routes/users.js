var express = require('express');
var router = express.Router();

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

router.get('/dashboard', authenticateToken, function(req, res, next) {
  if (req.user != null) {
    res.json(`Welcome, ${req.user.username}!`);
  }
  else {
    return res.status(400).json({ error: "Cannot authenticate token" });
  }
});

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
