'use strict';

var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;
var mongoose = require('mongoose');
var UserModel = mongoose.model('User');

module.exports = function (app) {

    var githubConfig = app.getValue('env').GITHUB;

    var githubCredentials = {
        clientID: githubConfig.clientID,
        clientSecret: githubConfig.clientSecret,
        callbackURL: githubConfig.callbackURL
    };

    var verifyCallback = function (accessToken, refreshToken, profile, done) {

      console.log('this is profile', profile)

      UserModel.findOne({ 'github.id': profile.id }, function (err, user) {

          if (err) return done(err);

          if (user) {
              done(null, user);
          } else {
              UserModel.create({
                  github: {
                    token: accessToken,
                    id: profile.id,
                    name: profile.displayName,
                    profileUrl: profile.profileUrl,
                    username: profile.username
                  }
              }).then(function (user) {
                  done(null, user);
              }, function (err) {
                  console.error('Error creating user from Github authentication', err);
                  done(err);
              });
          }

      });

    };

    passport.use(new GithubStrategy(githubCredentials, verifyCallback));

    app.get('/auth/github', passport.authenticate('github', {
        scope: ['user', 'user:email', 'public_repo', 'repo', 'repo_deployment', 'repo:status', 'gist', 'read:repo_hook']
    }));

    app.get('/auth/github/callback',
        passport.authenticate('github', { failureRedirect: '/login' }),
        function (req, res) {
            res.redirect('/home');
        });

};
