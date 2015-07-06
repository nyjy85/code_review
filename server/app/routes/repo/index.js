'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Repo = mongoose.model('Repo');
var User = mongoose.model('User');

module.exports = router;

router.get('/', function(req, res, next){
	Repo.findOne({url: req.query})
	.populate('files')
	.exec()
	.then(function(repo){
		console.log('this be file yo', repo)
		res.send(repo)
	})
	.then(null, next);

})


router.post('/', function(req, res, next){
	Repo.create(req.body)
	.then(function(repo){
		console.log('repo created', repo)
	})
	.then(null, next)
});
