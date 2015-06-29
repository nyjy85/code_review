'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Highlight = mongoose.model('Highlight');
var File = mongoose.model('File');

module.exports = router;

router.get('/', function(req, res, next){
	console.log('hit da highlight yo')
	Highlight.find({})
	.exec()
	.then(function(data){
		res.json(data)
	})
	.then(null, next)
})

router.get('/:user', function(req, res, next){
	Highlight.find({commenter: req.params.user})
	.exec()
	.then(function(highlighted){
		res.send(highlighted)
	})
	.then(null, next) 
})
// make sure to send back the User._id
// creates a new highlight doc and updates File
router.post('/', function(req, res, next){
	var newData = req.body.newData;
	var fileUrl = req.body.url;
	var fileInfo = req.body.fileInfo;
	var highlightInfo = req.body.highlightInfo;
	
	Highlight.checkForFileOnHighLight(newData, fileUrl, fileInfo, highlightInfo, next)
	.then(function(updatedFile){
		res.send("You made a new file/updated the file model with your highlight info")
	})
});

//newData, fileUrl, fileInfo, highlightInfo, callback)
	// Highlight.create(req.body.newData)
	// .then(function(highlighted){
	// 	File.findOne({fileUrl: req.body.url})
	// 	.exec()
	// 	.then(function(file){
	// 		if(!file){
	// 			File.create({fileUrl: "www.itworks.com"}).then(function(file){
	// 				file.highlighted.push(highlighted._id)
	// 				file.save(function(err, data){
	// 					if(err) return next(err);
	// 					res.send({message: 'highlighted portion created and file created'})
	// 				})
	// 			})
	// 		}else{
	// 		file.highlighted.push(highlighted._id)
	// 		file.save(function(err, data){
	// 			if(err) return next(err);
	// 			res.send({message: 'highlighted portion created and file updated'})
	// 			})
	// 		}
	// 	})
	// 	.then(null, next)
	// })
	// .then(null, next)

/////////////////////////////////////////////////////////////////////////////



// for when user makes updates to comment
router.put('/', function(req, res, next){
	Highlight.update({commenter: req.body.commenter}, req.body.newData)
	.exec()
	.then(function(updated){
		res.send({message: 'comment successfully updated'})
	})
	.then(null, next)
});

router.delete('/:id', function(req, res, next){
	Highlight.remove({_id: req.params.id})
	.exec()
	.then(function(highlighted){
		File.findOne({fileUrl: req.body.url})
		.exec()
		.then(function(file){
			file.higlighted = file.highlighted.filter(function(e){
				return e !== highlighted._id
			})
			file.save(function(err, data){
				if(err) return next(err);
				res.send({message: 'successfull removed'})
			})
		})
		.then(next, null)
	})
	.then(next, null)
})



