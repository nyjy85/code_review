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
