app.factory('LandingPageFactory', function($http, $window) {
    var domain = "http://localhost:1337", fileUrls, fileNames, highlights,
    data;

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
          var x = {url: url};
          return $http.get(domain + "/api/repo/all", {params: x})
          .then(function(res) {
              console.log('res in the factory', res)
              fileUrls = _.pluck(res.data.files, 'fileUrl');
              fileNames = fileUrls.map(function(fileurl){
                return fileurl.split('/').pop();
              });

            
              highlights = _.pluck(res.data.files, 'highlighted');
              
              data = {files: fileNames, highlights: highlights, fileUrls: fileUrls};
              
              return data;
          });
        },

        deleteHighlight: function(id){
          return $http.delete(domain+'/api/highlighted/'+id).then(function(res){
              // return res.data;
              console.log("delete highlight in the factoyr", res);
          })
        },

        linkToGit: function(link){
          $window.open(link);
        },

        logout: function() {
          return $http.get(domain +'/logout').then(function () {
      			//this needs a logic remap
            	console.log('logged out');
      		});
        }

    }


});
