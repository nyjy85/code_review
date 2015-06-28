app.factory('popupGitFactory', function($http, domain) {
    return {
        getAllProds: function() {
            //gets list of all available products from store
            return $http.get(domain.path + '/api/store/').then(function(res) {
                return res.data;
            });
        }
    }
});