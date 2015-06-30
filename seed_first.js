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
var Highlight = mongoose.model('Highlight');
var q = require('q');
var chalk = require('chalk');

var getCurrentHighlightData = function () {
    return q.ninvoke(Highlight, 'find', {});
};

var seedHighlights = function () {

    var highlights = [
        {
            code: ["tDb = require('./db');", "", "// Create a node server instance! cOoL!", "var server = require('http').createServer();", "", "var createApplication = function () {", "    var app = requir"],
            range: ['#LC6'],
            comment: "What an awesome piece of code",
            commenter: /*reference your USER db and add id here*/
        },
        {
            code: ["var concat = require('gulp-concat');", "var rename = require('gulp-rename');", "var sass = require('gulp-sass');", "var livereload = require('gulp-livereload');"],
            range: ['#LC8'],
            comment: "refactor please it's ugly",
            commenter: /*reference your USER db and add id here*/
        },
        {
            code: ["ode: [String], // array of code seperated by newline", "    range: [St"],
            range: ['#LC6'],
            comment: "SO DRY SO SO DRY",
            commenter:  /*reference your USER db and add id here*/
        },
        {
            code: ["ctToDb.then(function () {", "    getCurrentHighlightData().then(function (highlight) {", "        if (highlight"],
            range: ['#LC59'],
            comment: "COOL COOL COOLIO",
            commenter:  /*reference your USER db and add id here*/ 
        }
    ];

    return q.invoke(Highlight, 'create', highlights);

};

connectToDb.then(function () {
    console.log('hellow')
    getCurrentHighlightData().then(function (highlights) {
        console.log('ysldfds', highlights)
        if (highlights.length === 0) {
            return seedHighlights();
        } else {
            console.log(chalk.magenta('Seems to already be highlight data, exiting!'));
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