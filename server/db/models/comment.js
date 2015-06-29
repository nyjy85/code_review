'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    commit: String,
    highlighted: {
      code: String,
      range: [String], // this is the range of #ids that hold the highlighted area 
      comment: String
    },
    fileUrl: String,
    commenter: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, 
    repo: {
    	url: String, 
    	contributors: [String]
    }
});


mongoose.model('Comment', schema);