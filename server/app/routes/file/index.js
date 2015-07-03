'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var File = mongoose.model('File');

module.exports = router;

router.post('/', function(req, res){
	console.log('this is req.body', req.body)
	File.create(req.body)
		.then(function(file){
			console.log("this is the file in the post", file)
			res.send({message: "file successfully added"});
		}).then(null, function(err){
			res.status(500).send(err.message);
		});
});

// find by file_id - grabs all the data and sends to front
	// perhaps make it so that we find by fileUrl?
router.get('/:id', function(req, res, next){
	File.findOne({_id: req.params.id})
	.populate('highlighted')
	.exec()
	.then(function(file){
		console.log('this be file yo', file)
		res.send(file)
	})
	.then(null, next);
});

// find files by repo
// :id/file (repo.id)
router.get('/repo/:repo', function(req, res, next){
	console.log('find files by repo')
	File.find({"repo.name": req.params.repo})
	.exec()
	.then(function(files){
		console.log('files', files)
		res.send(files);
	})
	.then(null, next);
})
