'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Highlight = mongoose.model('Highlight');

module.exports = router;

router.get('/', function(req, res, next){
	console.log('hit da highlight yo')
	Highlight.find({})
	.exec()
	.then(function(data){
		res.send(data)
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
	var fileInfo = req.body.fileInfo;

	Highlight.checkForFileOnHighlight(newData, fileInfo, next)
	.then(function(updatedFile){
		//if you want something to res.send, you can change updatedFile in the static
		//in the highlight
		res.send("You made a new file/updated the file model with your highlight info");
	})
});


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
	var id = req.params.id;
	var url = req.body.url; 

	Highlight.deleteHighlight(id, url, next)
	.then(function(updatedFile){
		res.send('You have removed the highlight from the file');
	})
});




