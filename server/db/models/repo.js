'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
      name: String,
    	url: String,
    	contributors: [String],
      files: [{type: mongoose.Schema.Types.ObjectId, ref: 'File'}]
});


mongoose.model('Repo', schema);
