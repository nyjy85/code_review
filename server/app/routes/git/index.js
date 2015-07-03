'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var github = require('octonode');
var User = mongoose.model('User');

module.exports = router;

//Authentication

//grab all repos of the users
router.get('/', function(req, res, next){
  console.log('repoFromGit', req.query)
  var accessToken = req.query.token;
  var client = github.client(accessToken);
  client.get('/user/repos', {}, function(err, status, body, header) {
    if (err) return next(err);

    res.send(body);
  })

})
