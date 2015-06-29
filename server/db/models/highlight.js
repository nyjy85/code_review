'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    code: [String], // array of code seperated by newline
    range: [String], // this is the range of #ids that hold the highlighted area 
    comment: String,
    commenter: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});


mongoose.model('Highlight', schema);