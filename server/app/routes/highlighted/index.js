'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Highlight = mongoose.model('Highlight');
var User = mongoose.model('User');
var Repo = mongoose.model('Repo');

module.exports = router;

// gets all highilights. prob won't be necessary
router.get('/', function(req, res, next){
	console.log('hit da highlight yo')
	Highlight.find({})
	.exec()
	.then(function(data){
		res.send(data)
	})
	.then(null, next)
})

// just a test to get a highlight by id and see if persistence works
router.get('/:id', function(req, res, next){
	Highlight.findOne({_id: req.params.id})
	.exec()
	.then(function(highlighted){
		res.send(highlighted)
	})
	.then(null, next)
});

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
// router.post('/', function(req, res, next){
// 	console.log('req.body from da frrronnnt', req.body);
// 	var newData = req.body.newData;
// 	var fileInfo = req.body.fileInfo;
// 	var repoUrl = req.body.repoUrl;

// 	Highlight.checkForFileOnHighlight(newData, fileInfo, repoUrl, next)
// 	.then(function(updatedFile){
// 		//if you want something to res.send, you can change updatedFile in the static
// 		//in the highlight
// 		console.log('POST THIS IS RESPONSE', updatedFile)
// 		res.send(updatedFile);
// 	})
// });

router.post('/', function(req, res, next){
    console.log('req.body from da frrronnnt');

    var newData = req.body.newData;
    var fileInfo = req.body.fileInfo;
    var repoUrl = req.body.repoUrl;

    Highlight.checkForFileOnHighlight(newData, fileInfo, repoUrl, next)
    .then(function(updatedFile){
        //if you want something to res.send, you can change updatedFile in the static
        //in the highlight
        console.log('POST THIS IS RESPONSE', updatedFile)

        //sending notifications to user!!!!!!!!!!!!
        var fileId = updatedFile._id;
        Repo.findOne({url: repoUrl})
        .exec()
        .then(function(repo){
        	console.log('inside the Repo query!', repo)
            repo.contributors.forEach(function(contributor){
            	console.log('inside repo.contributors loop', contributor)
                User.findOne({"github.username": contributor})
                .exec()
                .then(function(user){
                    if(user) {
                            user.notifications.push({update: 'newHighlight', highlight: fileId})
                            user.save()
                            console.log('user notification!!!!!',user)
                    }
                })
            })
        })
        res.send(updatedFile);
    })
});


router.put('/:id', function(req, res, next){
	var id = req.params.id;
	var comment = req.body.data.comment.pop();
	console.log('THIS IS COMMENT ON TBE BAC', comment)
	Highlight.update({_id: id}, {$push: {comment: comment}})
	.exec()
	.then(function(response){
		console.log('this is response so send it!', response)

		//sending notifications to user!!!!!!!!!!!!
		// var fileId = updatedFile._id;
		// Repo.findOne({url: repoUrl})
		// .exec()
		// .then(function(repo){
		// 	repo.contributors.forEach(function(contributor){
		// 		User.findOne({"github.username": contributor})
		// 		.exec()
		// 		.then(function(user){
		// 			if(user) {
		// 					user.notifications.push(fileId)
		// 					user.save()
		// 					console.log('user notification!!!!!',user)
		// 			}
		// 		})
		// 	})
		// })

		res.send(response)
	})
	.then(null, next)
})


router.delete('/:id', function(req, res, next){
	var id = req.params.id;
	var url = req.body.url;
	Highlight.deleteHighlight(id, url, next)
	.then(function(updatedFile){
		res.send('You have removed the highlight from the file');
	})
});
