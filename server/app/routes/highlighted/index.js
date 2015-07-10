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
    console.log('req.body from da frrronnnt', req.body.newData.highlighted.startId);

    var newData = req.body.newData;
    var fileInfo = req.body.fileInfo;
    var repoUrl = req.body.repoUrl;
		var fileUrl = fileInfo.fileUrl;
		newData.fileUrl = fileUrl;

    Highlight.checkForFileOnHighlight(newData, fileInfo, repoUrl, next)
    .then(function(updatedFile){
        //if you want something to res.send, you can change updatedFile in the static
        //in the highlight
        // console.log('POST THIS IS RESPONSE', updatedFile)

				var commenter = updatedFile.comment[updatedFile.comment.length -1].commenter;
				var timestamp = updatedFile.comment[updatedFile.comment.length -1].timestamp;
				var line = updatedFile.highlighted.startId;

        //sending notifications to user!!!!!!!!!!!!
        Repo.findOne({url: repoUrl})
        .exec()
        .then(function(repo){

        	// console.log('inside the Repo query!', repo)
            repo.contributors.forEach(function(contributor){
            	// console.log('inside repo.contributors loop', contributor)
                User.findOne({"github.username": contributor})
                .exec()
                .then(function(user){
                    if(user) {

													//search user noti -> check if update + commenter + fileUrl already exist
													var checkExist = user.notifications.filter(function(noti){
															return noti.update === 'newHighlight' && noti.commenter === commenter && noti.fileUrl === fileUrl;
													})

													if(checkExist.length === 0) {
														user.notifications.push({update: 'newHighlight', commenter: commenter, timestamp: timestamp, fileUrl: fileUrl, number: 1})
                          	user.save()

													}	else {
														var i = user.notifications.indexOf(checkExist[0]);
														console.log('give me the index!', i)
														user.notifications[i].number ++
														user.notifications[i].timestamp = timestamp;
														user.save()
													}
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
	var repoUrl = req.body.data.fileUrl.split('/').slice(0,5).join('/');
	var comment = req.body.data.comment.pop();
	// var line = req.body.data.highlighted.startId;


	console.log('THIS IS COMMENT ON TBE BAC', comment)
	Highlight.update({_id: id}, {$push: {comment: comment}})
	.exec()
	.then(function(response){
		console.log('this is response so send it!', response)

		Highlight.findOne({_id: id})
		.exec()
		.then(function(highlight){
			var savedComment = highlight.comment.pop();
			var timestamp = savedComment.timestamp;
			var commenter = savedComment.commenter;
			var fileUrl = highlight.fileUrl;
			var line = highlight.highlighted.startId;

		//sending notifications to user!!!!!!!!!!!!
		Repo.findOne({url: repoUrl})
		.exec()
		.then(function(repo){
			repo.contributors.forEach(function(contributor){
				User.findOne({"github.username": contributor})
				.exec()
				.then(function(user){
					if(user) {

						//search user noti -> check if update + commenter + fileUrl already exist
						var checkExist = user.notifications.filter(function(noti){
								return noti.update === 'newComment' && noti.commenter === commenter && noti.fileUrl === fileUrl && noti.line === line;
						})

						if(checkExist.length === 0) {
							user.notifications.push({update: 'newComment', commenter: commenter, timestamp: timestamp, fileUrl: fileUrl, line: line, number: 1})
							user.save()

						}	else {
							var i = user.notifications.indexOf(checkExist[0]);
							console.log('give me the index!', i)
							user.notifications[i].number ++
							user.notifications[i].timestamp = timestamp;
							user.save()
						}
							console.log('user notification!!!!!',user)
					}
				})
			})
		})

		})


		res.send(response)
	})
	.then(null, next)
})


router.delete('/:id', function(req, res, next){
	var id = req.params.id;
	var url;
	req.query.url ? url = req.query.url : url = req.body.url;

	Highlight.deleteHighlight(id, url, next)
	.then(function(message){
		
		res.send(message);
	})
});
