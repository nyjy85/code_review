app.factory('popupGitFactory', function($http) {
    return {
        // getAllProds: function() {
        //     //gets list of all available products from store
        //     return $http.get(domain.path + '/api/store/').then(function(res) {
        //         return res.data;
        //     });
        // },
        getUserInfo: function() {
          return $http.get("http://localhost:1337/session").then(function(res){
            return res.data;
          });
        }

    }
});
