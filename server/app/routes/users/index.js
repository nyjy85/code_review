'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = router;

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

// router.get('/test', function(req, res, next){
// 	console.log('yo work dammit')
// 	User.find({})
// 	.exec()
// 	.then(function(user){
// 		res.send(user)
// 	})
// 	.then(next, null)
// })

// creates new user
router.post('/', function(req, res, next){
	User.create(req.body)
	.then(function(user){
		console.log('user has been created!', user)
		res.send({message: 'user saved!'})
	})
	.then(next, null)
});

// adds a repo to the user's repo array
router.put('/addRepo/:user', function(req, res, next){
	console.log('am i heerrr', req.params.user)
	User.findOne({'github.username': req.params.user})
	.exec()
	.then(function(user){
		console.log('an in herrrr', user)
		user.repos.push(req.body.repo);
		user.save(function(err, data){
			console.log('this be data', data)
			res.send(data)
		})
	})
	.then(next, null)
});
