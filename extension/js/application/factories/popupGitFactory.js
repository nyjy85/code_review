app.factory('popupGitFactory', function($http) {
    var domain = "http://localhost:1337";

    return {
        // getAllProds: function() {
        //     //gets list of all available products from store
        //     return $http.get(domain.path + '/api/store/').then(function(res) {
        //         return res.data;
        //     });
        // },
        getUserInfo: function() {
          return $http.get(domain + "/session").then(function(res){
            return res.data;
          });
        },

        getReposToAdd: function(token) {
          console.log('hit getrepo', token)
          return $http.get(domain + "/api/git/reposFromGit", {params: token})
          .then(function(res) {
            return res.data;
          })
        },

        addRepoToProfile: function(user, repo) {
          console.log('addRepoToProfile factory',user, repo)
          var repo = {repo: {url: repo.html_url, name: repo.name}}
          return $http.put(domain + "/api/users/addRepo/" + user.github.username, repo)
          .then(function(res) {
            return res.data;
          })
        }

    }
});


//extension on
//tab bar
//
