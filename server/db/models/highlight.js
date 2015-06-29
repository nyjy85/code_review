'use strict';

var mongoose = require('mongoose');
var _ = require('lodash');
var Q = require('q');

var schema = new mongoose.Schema({
    code: [String], // array of code seperated by newline
    range: [String], // this is the range of #ids that hold the highlighted area 
    comment: String,
    commenter: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

var checkForFileOnHighlight = function(newData, fileUrl, fileInfo, highlightInfo, callback) {
	var highlightPromise = this.create(newData);
	var filePromise = this.model('File').findOne(fileUrl).exec();

	return Q.all([highlightPromise, filePromise]).then(function(results){
		var highlight = results[0], file = results[1];
            if(!file){
                this.model('File').create(fileInfo).then(function(fileCreated){
                    fileCreated.highlighted.push(highlight._id)
                    fileCreated.save(callback);
                })
            }else{
                file.highlighted.push(highlight._id)
                file.save(callback); 
            }
        return;
	}, callback)
};

schema.statics.checkForFileOnHighlight = checkForFileOnHighlight;


mongoose.model('Highlight', schema);