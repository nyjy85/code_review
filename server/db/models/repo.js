'use strict';

var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');

var schema = new mongoose.Schema({
    name: String,
    url: String,
    contributors: [String],
    files: [{type: mongoose.Schema.Types.ObjectId, ref: 'File'}]
});

schema.plugin(deepPopulate);

// if we want to go back and cut data down for
// the deepPopulate
// schema.plugin(deepPopulate, {
// 	populate: {
// 		'files.highlighted': {
// 			select: 'comment'
// 		}
// 	}
// })


mongoose.model('Repo', schema);
