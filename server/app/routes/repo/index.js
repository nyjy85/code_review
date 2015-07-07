'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Repo = mongoose.model('Repo');
var User = mongoose.model('User');

module.exports = router;

router.get('/', function(req, res, next){
	console.log('get repo from Repo.db', req.user.populate('repos'))
	Repo.findOne({url: req.query.url})
	.populate('files')
	.exec()
	.then(function(repo){
		// console.log('this be file yo', repo)
		if (!repo) {
			return Repo.create(req.query)

		}
		else {
			return repo;
		}
	})
	.then(function(repo){
		req.user.addRepo(repo, function(err, user){
			console.log('repo', repo)
			console.log('user', user)
			if (err) return next(err);

			if (user) return res.send({repo: repo});

			return res.send({repo: repo, userAlreadyHad: true})
		})
	})
	.then(null, next);

})

//get all
router.get('/all', function(req, res, next){
	Repo.findOne({url: req.query.url})
	.populate('files')
	.exec()
	.then(function(repo){
		res.send(repo);
	})
})

// router.post('/', function(req, res, next){
// 	Repo.create(req.body)
// 	.then(function(repo){
// 		// console.log('repo created', repo)
// 	})
// 	.then(null, next)
// });
