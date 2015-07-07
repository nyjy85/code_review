'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Repo = mongoose.model('Repo');
var User = mongoose.model('User');

module.exports = router;

router.get('/', function(req, res, next){
	Repo.findOne({url: req.query.url})
	.populate('files')
	.exec()
	.then(function(repo){
		if (!repo) {
			return Repo.create(req.query)
		} else {
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
    Repo.findOne({url: req.query.url})
    .populate('files')
    .exec()
    .then(function(repo){
        res.send(repo);
    })
})
