'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    fileUrl: String,
    commit: String,
    highlighted: [{type: mongoose.Schema.Types.ObjectId, ref: 'Highlight'}],
    repo: {
      name: String,
    	url: String,
    	contributors: [String] // this will be collaborators (for sharing to other users)
    }
});


mongoose.model('File', schema);
