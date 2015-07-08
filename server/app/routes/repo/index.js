'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Repo = mongoose.model('Repo');
var User = mongoose.model('User');


module.exports = router;

router.get('/', function(req, res, next){
	var query = req.query;
	// console.log('requser',req.user.github.username )

	if (query.contributors.indexOf(req.user.github.username) === -1) {
		query.contributors.push(req.user.github.username);
	};

	console.log('alsdkfjasdfa',query.contributors)

	Repo.findOne({url: query.url})
	.populate('files')
	.exec()
	.then(function(repo){
		console.log('adding repooooo', repo)
		if (!repo) {
			return Repo.create(query)

		} else {

			//add contributors to a repo if that repo exist & if contributor is not a current one
			if (repo.contributors.indexOf(req.user.github.username) === -1) {
				repo.contributors.push(req.user.github.username);
				repo.save();
			};

			return repo;
		}
	})
	.then(function(repo){
		req.user.addRepo(repo, function(err, user){
			if (err) return next(err);

			if (user) return res.send({repo: repo});
			else return res.send({repo: repo, userAlreadyHad: true})

		})
	})
	.then(null, next);

})


router.get('/all', function(req, res, next){
	console.log('hitting the repo route', req.query)
    Repo.findOne({url: req.query.url})
    .populate('files')
    .deepPopulate('files.highlighted')
    .exec()
    .then(function(repo){
    	console.log('hiiiiii in the router', repo)
        res.send(repo);
    })
})
