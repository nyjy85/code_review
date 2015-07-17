var dbURI = 'mongodb://localhost:27017/code-review';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');

// Require in all models.
require('../../../server/db/models');

var File = mongoose.model('File');

describe('File model', function () {

    beforeEach('Establish DB connection', function (done) {
        if (mongoose.connection.db) return done();
        mongoose.connect(dbURI, done);
    });

    afterEach('Clear test database', function (done) {
        clearDB(done);
    });

    it('should exist', function () {
        expect(File).to.be.a('function');
    });

    describe('REST', function () {


        it('should be able to POST', function (done) {
            createUser().then(function () {
                var generatedSalt = saltSpy.getCall(0).returnValue;
                expect(encryptSpy.calledWith('potus', generatedSalt)).to.be.ok;
                done();
            });
        });

        it('should be able to GET by file URL', function (done) {
           createUser().then(function (user) {
               var generatedSalt = saltSpy.getCall(0).returnValue;
               expect(user.salt).to.be.equal(generatedSalt);
               done();
           });
        });

        it('should be able GET find by repo', function (done) {
            createUser().then(function (user) {
                var createdPassword = encryptSpy.getCall(0).returnValue;
                expect(user.password).to.be.equal(createdPassword);
                done();
            });
        });

        it('should be able DELETE', function (done) {
            createUser().then(function (user) {
                var createdPassword = encryptSpy.getCall(0).returnValue;
                expect(user.password).to.be.equal(createdPassword);
                done();
            });
        });

    });

});
