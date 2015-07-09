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
        LandingPageFactory.getReposToAdd(response.user._id).then(function(res){
              $scope.reposArray = res.repos;
        })
      })   



    $scope.getFiles = function(url) {
        $scope.showHighlight = false;
        console.log('whats uppppssss', url)
        LandingPageFactory.listFiles(url).then(function(response){
            console.log("WHYYYYYYY", response)
            $scope.filesArray = response.files;
            $scope.urlArray = response.fileUrls;
            $scope.highlightArray = response.highlights;
        });   
    };

    $scope.getHighlights = function(file, index) {

        $scope.highlight = $scope.highlightArray[index];
        $scope.indexOfFile = index;
        $scope.showHighlight = true; 
    };

    $scope.deleteComment = function(index){
        LandingPageFactory.deleteHighlight($scope.highlight[index]._id)
            .then(function(response){
                // $scope.highlight = response;
                console.log(response);
            });
        //$scope.codeArray[$scope.indexOfFile][index]
    };

    $scope.linkToGitPage = function(index){
        // var startId = $scope.highlightArray[$scope.indexOfFile][index].highlighted.startId;
        var url = $scope.urlArray[$scope.indexOfFile];
        LandingPageFactory.linkToGit(url);
    }

});


