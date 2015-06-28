'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Q = require('q');
var _ = require('lodash');

module.exports = router;



router.post('/', function(req, res){
	console.log('this is req.body', req.body)
	mongoose.model('Comment')
		.create(req.body)
		.then(function(comment){

			console.log("this is the comment in the post", comment)
			res.send(comment);
		}, function(err){
			res.status(500).send(err.message);
		})
});