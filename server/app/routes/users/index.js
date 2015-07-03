'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = router;

//Authentication

router.get('/:id', function(req, res, next){
	console.log('inside the get for user', req.params.id)
	User.findOne({_id: req.params.id})
	.exec()
	.then(function(user){
		console.log('got them users', user)
		res.send(user)
	})
	.then(next, null)
})

// creates new user
router.post('/', function(req, res, next){
	User.create(req.body)
	.then(function(user){
		console.log('user has been created!', user)
		res.send({message: 'user saved!'})
	})
	.then(null, next)
});

// add or delete a repo to the user's repo array
router.put('/:username/editRepo', function(req, res, next){
	User.findOne({'github.username': req.params.user})
	.exec()
	.then(function(user){
		user.repos = req.body.repo;
		user.save(function(err, data){
			console.log('this be data', data)
			res.send(data)
		})
	})
	.then(null, next)
});
