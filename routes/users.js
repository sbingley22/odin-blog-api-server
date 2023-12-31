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

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({username: username}).exec();
    if (user) {
      console.log(user.password)
      const match = await bcrypt.compare(password, user.password);
      console.log(match)
      if (!match) {
        res.send('Password incorrect')
        return
      }
      const accessToken = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET);
      res.json({ accessToken: accessToken });
    } else {
      res.send('Username incorrect');
    }
  } catch (err) {
    console.log("Error finding user in database or comparing password", err)
    res.sendStatus(403)
  }
})

module.exports = router;
