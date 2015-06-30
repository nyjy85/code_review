'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var github = require('octonode');
var User = mongoose.model('User');

module.exports = router;

//grab all repos of the users
router.get('/reposFromGit', function(req, res, next){
  console.log('repoFromGit', req.query)
  var accessToken = req.query.token;
  var client = github.client(accessToken);
  client.get('/user/repos', {}, function(err, status, body, header) {
    if (err) return next(err);
    
    res.send(body);
  })

})

//add repo to User model -> access to hightlight feature
// router.post('/addRepoToProfile', function(req, res, next){
//   console.log('req.query', req.body)
//   var username = req.body.username;
//   var repo = {url: req.body.url, name: req.body.repo_name}
//
//   User.findOne({github.username: username})
//   .exec()
//   .then(function(user){
//     user.repos.push(repo)
//     user.save(function(err,data){
//       if(err) return next(err);
//       res.send({message: 'successfully added repo to profile'})
//     })
//   })
//   .then(null, next);
//
// })

//
// name: 'meowsic',
//   full_name: 'codingmeow/meowsic',
//   owner:
//    { login: 'codingmeow',
//      id: 11342594,
//      avatar_url: 'https://avatars.githubusercontent.com/u/11342594?v=3',
//      gravatar_id: '',
//      url: 'https://api.github.com/users/codingmeow',
//      html_url: 'https://github.com/codingmeow',
//      followers_url: 'https://api.github.com/users/codingmeow/followers',
//      following_url: 'https://api.github.com/users/codingmeow/following{/other_user}',
//      gists_url: 'https://api.github.com/users/codingmeow/gists{/gist_id}',
//      starred_url: 'https://api.github.com/users/codingmeow/starred{/owner}{/repo}',
//      subscriptions_url: 'https://api.github.com/users/codingmeow/subscriptions',
//      organizations_url: 'https://api.github.com/users/codingmeow/orgs',
//      repos_url: 'https://api.github.com/users/codingmeow/repos',
//      events_url: 'https://api.github.com/users/codingmeow/events{/privacy}',
//      received_events_url: 'https://api.github.com/users/codingmeow/received_events',
//      type: 'User',
//      site_admin: false },
//   private: false,
//   html_url: 'https://github.com/codingmeow/meowsic',
//   description: 'App that analyzes audio input, determines its frequency and harmonizes with meows',
//   fork: false,
//   url: 'https://api.github.com/repos/codingmeow/meowsic',
//   forks_url: 'https://api.github.com/repos/codingmeow/meowsic/forks',
//   keys_url: 'https://api.github.com/repos/codingmeow/meowsic/keys{/key_id}',
//   collaborators_url: 'https://api.github.com/repos/codingmeow/meowsic/collaborators{/collaborator}',
//   teams_url: 'https://api.github.com/repos/codingmeow/meowsic/teams',
//   hooks_url: 'https://api.github.com/repos/codingmeow/meowsic/hooks',
//   issue_events_url: 'https://api.github.com/repos/codingmeow/meowsic/issues/events{/number}',
//   events_url: 'https://api.github.com/repos/codingmeow/meowsic/events',
//   assignees_url: 'https://api.github.com/repos/codingmeow/meowsic/assignees{/user}',
//   branches_url: 'https://api.github.com/repos/codingmeow/meowsic/branches{/branch}',
//   tags_url: 'https://api.github.com/repos/codingmeow/meowsic/tags',
//   blobs_url: 'https://api.github.com/repos/codingmeow/meowsic/git/blobs{/sha}',
//   git_tags_url: 'https://api.github.com/repos/codingmeow/meowsic/git/tags{/sha}',
//   git_refs_url: 'https://api.github.com/repos/codingmeow/meowsic/git/refs{/sha}',
//   trees_url: 'https://api.github.com/repos/codingmeow/meowsic/git/trees{/sha}',
//   statuses_url: 'https://api.github.com/repos/codingmeow/meowsic/statuses/{sha}',
//   languages_url: 'https://api.github.com/repos/codingmeow/meowsic/languages',
//   stargazers_url: 'https://api.github.com/repos/codingmeow/meowsic/stargazers',
//   contributors_url: 'https://api.github.com/repos/codingmeow/meowsic/contributors',
//   subscribers_url: 'https://api.github.com/repos/codingmeow/meowsic/subscribers',
//   subscription_url: 'https://api.github.com/repos/codingmeow/meowsic/subscription',
//   commits_url: 'https://api.github.com/repos/codingmeow/meowsic/commits{/sha}',
//   git_commits_url: 'https://api.github.com/repos/codingmeow/meowsic/git/commits{/sha}',
//   comments_url: 'https://api.github.com/repos/codingmeow/meowsic/comments{/number}',
//   issue_comment_url: 'https://api.github.com/repos/codingmeow/meowsic/issues/comments{/number}',
//   contents_url: 'https://api.github.com/repos/codingmeow/meowsic/contents/{+path}',
//   compare_url: 'https://api.github.com/repos/codingmeow/meowsic/compare/{base}...{head}',
//   merges_url: 'https://api.github.com/repos/codingmeow/meowsic/merges',
//   archive_url: 'https://api.github.com/repos/codingmeow/meowsic/{archive_format}{/ref}',
//   downloads_url: 'https://api.github.com/repos/codingmeow/meowsic/downloads',
//   issues_url: 'https://api.github.com/repos/codingmeow/meowsic/issues{/number}',
//   pulls_url: 'https://api.github.com/repos/codingmeow/meowsic/pulls{/number}',
//   milestones_url: 'https://api.github.com/repos/codingmeow/meowsic/milestones{/number}',
//   notifications_url: 'https://api.github.com/repos/codingmeow/meowsic/notifications{?since,all,participating}',
//   labels_url: 'https://api.github.com/repos/codingmeow/meowsic/labels{/name}',
//   releases_url: 'https://api.github.com/repos/codingmeow/meowsic/releases{/id}',
//   created_at: '2015-05-23T17:58:58Z',
//   updated_at: '2015-05-23T21:27:43Z',
//   pushed_at: '2015-05-23T21:35:44Z',
//   git_url: 'git://github.com/codingmeow/meowsic.git',
//   ssh_url: 'git@github.com:codingmeow/meowsic.git',
//   clone_url: 'https://github.com/codingmeow/meowsic.git',
//   svn_url: 'https://github.com/codingmeow/meowsic',
//   homepage: null,
//   size: 220,
//   stargazers_count: 0,
//   watchers_count: 0,
//   language: null,
//   has_issues: true,
//   has_downloads: true,
//   has_wiki: true,
//   has_pages: false,
//   forks_count: 0,
//   mirror_url: null,
//   open_issues_count: 0,
//   forks: 0,
//   open_issues: 0,
//   watchers: 0,
//   default_branch: 'master',
//   permissions: { admin: false, push: true, pull: true } }
