app.factory('LandingPageFactory', function($http, $window) {
    var domain = "http://localhost:1337", fileUrls, fileNames, highlights,
    data;

    return {

        getUserInfo: function() {
          return $http.get(domain + "/session").then(function(res){
            return res.data;
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
            
              fileUrls = _.pluck(res.data.files, 'fileUrl');
              fileNames = fileUrls.map(function(fileurl){
                  var url = fileurl.split('/');
                  return url.slice(url.indexOf('blob')+2).join('/');
              });

              highlights = _.pluck(res.data.files, 'highlighted');
              data = {files: fileNames, highlights: highlights, fileUrls: fileUrls};
              
              return data;
          });
        },

        deleteFile: function(url){
          var x = {url: url};
          return $http.delete(domain+'/api/file/', {params: x})
          .then(function(res){
            console.log('delete file, LandingPagefactory', res);
          });
        },

        deleteHighlight: function(id, url){
          var x = {url: url};
          return $http.delete(domain+'/api/highlighted/'+id, {params: x}).then(function(res){
            console.log("deleted highlight, LandingPagefactory", res);
          });
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
