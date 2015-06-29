'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    fileUrl: String,
    commit: String,
    highlighted: [{type: mongoose.Schema.Types.ObjectId, ref: 'Highlight'}],
    repo: {
    	url: String, 
    	contributors: [String]
    }
});


mongoose.model('File', schema);