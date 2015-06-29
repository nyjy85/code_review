/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

Refer to the q documentation for why and how q.invoke is used.

*/

var mongoose = require('mongoose');
var connectToDb = require('./server/db');
var File = mongoose.model('File');
var q = require('q');
var chalk = require('chalk');

var getCurrentFileData = function () {
    return q.ninvoke(File, 'find', {});
};

var seedFile = function () {

    var files = [
        {
            fileUrl: 'https://github.com/nyjy85/code_review/blob/master/server/main.js',
            commit: "769cd90b611a6156c3663fbea798a6f1c2070692",
            highlighted: [/*reference your db and add id here*/],
            repo: {url:'https://github.com/nyjy85/code_review', contributors: ['cschoi3', 'nyjy85', 'eueueleelee']}
        },
        {
            fileUrl: 'https://github.com/nyjy85/test_for_CR/blob/master/index.js',
            commit: '014276ce4dede4db58cb2698acdf7e01675dda97',
            highlighted: [/*reference your db and add id here*/],
            repo: {url:'https://github.com/nyjy85/test_for_CR', contributors: ['cschoi3', 'nyjy85', 'eueueleelee']}
        },
        {
            fileUrl: 'https://github.com/nyjy85/code_review/blob/master/server/db/models/highlight.js',
            commit: 'fc327d4cf71487e103d4025f1e9e444317aca38b',
            highlighted: [/*reference your db and add id here*/],
            repo: {url:'https://github.com/nyjy85', contributors: ['cschoi3', 'eueueleelee', 'nyjy85']}
        },
        {
            fileUrl: 'https://github.com/nyjy85/test_for_CR/blob/master/app.js',
            commit: '012cd717f44a97c9e559e5ed81255d128e20c415',
            highlighted: [/*reference your db and add id here*/],
            repo: {url:'https://github.com/nyjy85/code_review', contributors: ['cschoi3', 'eueueleelee', 'nyjy85']}
        }
    ];

    return q.invoke(File, 'create', files);

};

connectToDb.then(function () {
    getCurrentFileData().then(function (files) {
        if (files.length === 0) {
            return seedFile();
        } else {
            console.log(chalk.magenta('Seems to already be file data, exiting!'));
            process.kill(0);
        }
    }).then(function () {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    }).catch(function (err) {
        console.error(err);
        process.kill(1);
    });
});