'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var _ = require('lodash');

module.exports = router;

//Authentication

router.get('/:id', function(req, res, next){
	console.log('inside the get for user', req.params.id)
	User.findOne({_id: req.params.id})
	.populate('repos')
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
	User.findOne({'github.username': req.params.username})
	.exec()
	.then(function(user){
		var repoIds = _.pluck(req.body.repo, '_id');
		user.repos = repoIds;
		user.save(function(err, data){
			console.log('editRepo', err, data)
			res.send(data)
		})
	})
	.then(null, next)
});

//archive repo
// router.put('/:username/archiveRepo', function(req, res, next){
// 	User.findOne({'github.username': req.params.username})
// 	.exec()
// 	.then(function(user){
// 		user.archives = req.body.archives;
// 		user.save(function(err, data){
// 			console.log('archiveRepo', data)
// 			res.send(data)
// 		})
// 	})
// 	.then(null, next)
// });
