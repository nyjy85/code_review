'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    email: {
        type: String
    },
    password: {
        type: String
    },
    salt: {
        type: String
    },
    github: {
      token: String,
      id: String,
      name: String,
      profileUrl: String,
      username: String
    },
    repos: [{type: mongoose.Schema.Types.ObjectId, ref: 'Repo'}]
    // archives: [{url: String, name: String, contributors: [String]}]
});

// generateSalt, encryptPassword and the pre 'save' and 'correctPassword' operations
// are all used for local authentication security.

schema.method('addRepo', function(repo, cb) {
  //access to all users repo
  if (this.repos.indexOf(repo._id) === -1) {
    this.repos.push(repo._id);
    this.save(cb)
  }
  else {
    cb(null, null)
  }


})

var generateSalt = function () {
    return crypto.randomBytes(16).toString('base64');
};

var encryptPassword = function (plainText, salt) {
    var hash = crypto.createHash('sha1');
    hash.update(plainText);
    hash.update(salt);
    return hash.digest('hex');
};

schema.pre('save', function (next) {

    if (this.isModified('password')) {
        this.salt = this.constructor.generateSalt();
        this.password = this.constructor.encryptPassword(this.password, this.salt);
    }

    next();

});

schema.statics.generateSalt = generateSalt;
schema.statics.encryptPassword = encryptPassword;

schema.method('correctPassword', function (candidatePassword) {
    return encryptPassword(candidatePassword, this.salt) === this.password;
});

mongoose.model('User', schema);
