app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'LandingPageCtrl'
    });
});

app.controller('LandingPageCtrl', function ($scope, AuthService, $state, LandingPageFactory) {

    $scope.login = {};
    $scope.error = null;
    $scope.filesArray;
    $scope.showHighlight = false;

      LandingPageFactory.getUserInfo().then(function(response){
        console.log("this is in the LANDING controller", response.user)
        LandingPageFactory.getReposToAdd(response.user._id).then(function(res){
            console.log('this is the repos to add', res)
              $scope.reposArray = res.repos;
        })
      })   



    $scope.getFiles = function(url) {
        console.log('whats uppppssss', url)
        LandingPageFactory.listFiles(url).then(function(response){
            console.log('in the ctonrolller', response)
            
            var fileUrls = _.pluck(response, 'fileUrl');
            var fileNames = fileUrls.map(function(fileurl){
                return fileurl.split('/').pop();
            });
            $scope.filesArray = fileNames;

            var highlights = _.pluck(response, 'highlighted');
            $scope.highlightArray = highlights;
        });   
    }

    $scope.getHighlights = function(file, index) {
        console.log('thi sis highilhgts', file, index)

        $scope.highlight = $scope.highlightArray[index]
        $scope.showHighlight = true;
    }

});
