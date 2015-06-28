'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    repo_url: String,
    commit: String,
    comment: String,
    highlighted: {
      code: String,
      indexOf: Number
    },
    fileUrl: String,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}

});



mongoose.model('Comment', schema);