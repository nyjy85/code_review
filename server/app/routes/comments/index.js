'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Q = require('q');
var _ = require('lodash');
var Comment = mongoose.model('Comment');

module.exports = router;



router.post('/', function(req, res){
	console.log('this is req.body', req.body)
	Comment.create(req.body)
		.then(function(comment){
			console.log("this is the comment in the post", comment)
			res.send({message: "comment successfully added"});
		}, function(err){
			res.status(500).send(err.message);
		})
});

// find by fileUrl - grabs all the data and sends to front
router.get('/', function(req, res, next){
	Comment.findOne({fileUrl: 'something'})
	.populate('commenter')
	.exec()
	.then(function(comment){
		res.send(comment)
	})
	.then(null, next);
});

router.put('')



