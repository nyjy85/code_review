'use strict';

var mongoose = require('mongoose');
var Q = require('q');

var schema = new mongoose.Schema({
    code: [String], // array of code seperated by newline
    comment:  [
        {
            timestamp: {
                type: Date,
                default: Date.now()
            },
            commenter: String,
            message: String
        }
    ],
    highlighted: {
        startId: String,
        endId: String,
        startNode: String,
        endNode: String,
        startOffset: Number,
        endOffset: Number
    },
    commenter: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

var checkForFileOnHighlight = function(newData, fileInfo, repoUrl, callback) {
    console.log('newDATA.comment', newData)
    newData.comment = [newData.comment];

    var highlightPromise = this.create(newData);
	var filePromise = mongoose.model('File').findOne({fileUrl: fileInfo.fileUrl}).exec();
    var repoPromise = mongoose.model('Repo').findOne({url: repoUrl}).exec();

    //return Q.all([highlightPromise, filePromise]).spread(function(highlight, file){
        // var highlight = results[0], file = results[1];

	return Q.all([highlightPromise, filePromise, repoPromise]).then(function(results){
		var highlight = results[0], file = results[1], repo = results[2];

            if(!file){
                mongoose.model('File').create(fileInfo).then(function(file){
                    repo.files.push(file._id);
                    repo.save(callback);

                    file.highlighted.push(highlight._id)
                    file.save(callback);
                })

            }else{
                file.highlighted.push(highlight._id);
                file.save(callback);
            }
        return highlight;
	}, callback)
};

schema.statics.checkForFileOnHighlight = checkForFileOnHighlight;

var deleteHighlight = function(id, url, callback) {

    var removeHighlightPromise = this.remove({_id: id}).exec();
    var filePromise = mongoose.model("File").findOne({fileUrl: url}).exec();

    return Q.all([removeHighlightPromise, filePromise]).then(function(results){
        var file = results[1];
            file.highlighted.splice(file.highlighted.indexOf(id),1);
            file.save(callback);
        return;
    }, callback)
};

schema.statics.deleteHighlight = deleteHighlight;

mongoose.model('Highlight', schema);
