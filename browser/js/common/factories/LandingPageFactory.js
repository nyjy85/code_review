app.factory('LandingPageFactory', function($http) {
    var domain = "http://localhost:1337";

    return {

        getUserInfo: function() {
          return $http.get(domain + "/session").then(function(res){
            return res.data; //res.data.user
          });
        },

        getReposToAdd: function(id) {
          return $http.get(domain + "/api/users/"+id)
          .then(function(res) {
            return res.data;
          })
        },

        listFiles: function(url) {
          console.log('list file names under the repo')
          var x = {url: url}
          return $http.get(domain + "/api/repo/all", {params: x})
          .then(function(res) {
            return res.data.files;
          });
        },

        listHighlights: function(highlightIds){

        },

        logout: function() {
          console.log('hitting the factory');
          return $http.get(domain +'/logout').then(function () {
      			//this needs a logic remap
            	console.log('logged out');
      		});
        }

    }
});
