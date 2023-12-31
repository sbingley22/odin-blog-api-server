var express = require('express');
var router = express.Router();

const Blog = require('../models/blog')

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/blogs', (req, res, next) => {

})

module.exports = router;
