'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var github = require('octonode');
var User = mongoose.model('User');

module.exports = router;


//Authentication

//grab all repos of the users
router.get('/', function(req, res, next){
  // console.log('repoFromGit', req.query)
  var accessToken = req.query.token;
  var client = github.client(accessToken);
  client.get('/user/repos', {}, function(err, status, body, header) {
    if (err) return next(err);

    res.send(body);
  })

})


// GET /repos/:owner/:repo/contributors
router.get('/repos/:owner/:repo/contributors', function(req, res, next){
  console.log('repo contributor', req.user.github.token)

  var accessToken = req.user.github.token;
  var client = github.client(accessToken);
  var owner = req.params.owner;
  var repo = req.params.repo; //'codingmeow/meowsic'
  var obj = owner + '/' + repo;
  console.log('!!!!!',accessToken)

  client.repo(obj).contributors(function(err, status, body, header) {
    if (err) return next(err);

    console.log('status', status)

    var contributors = [];
    status.forEach(function(i){
      contributors.push(i.login)
    })

    res.send(contributors);
  })

})
