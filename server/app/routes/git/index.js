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


// GET /repos/:owner/:repo/contributors
router.get('/contributors', function(req, res, next){
  console.log('repo contributor', req.query)
  // var accessToken = req.query.token;
  // var client = github.client(accessToken);
  // var repo = req.params.repo //'codingmeow/meowsic'
  //
  // client.repo(repo).contributors(function(err, status, body, header) {
  //   if (err) return next(err);
  //
  //   var contributors = [];
  //   status.forEach(function(i){
  //     contributors.push(i.login)
  //   })
  //
  //   res.send(contributors);
  // })

})



// var accessToken = '29831d100debca65c503105d2406ec68ccc89ea7';
// var client = github.client(accessToken);
// var repo = "eueuleelee/00_Assessment_Practice"
//
// client.repo(repo).contributors(function(err, status, body, header) {
//   if (err) return next(err);
//
//   console.log('hello123',status);
// })
