'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    timestamp: {
      type: Date,
      default: Date.now()
    },
    fileUrl: String, //required
    commit: String,
    highlighted: [{type: mongoose.Schema.Types.ObjectId, ref: 'Highlight'}]
});


mongoose.model('File', schema);

//grab the repo name of fileUrl (slice)
//look for its repo_id in the repo database
//push repo_id into File db's repo field
