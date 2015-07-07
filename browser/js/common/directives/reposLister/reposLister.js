app.directive('repos', function ($state, LandingPageFactory) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/reposLister/reposLister.html',
        controller: 'LandingPageCtrl',
        link: function (scope) {

          LandingPageFactory.getUserInfo().then(function(response){
            console.log("this is in the LANDING controller", response.user)
            LandingPageFactory.getReposToAdd(response.user._id).then(function(res){
                console.log('this is the repos to add', res)
                  scope.array = res.repos;
            })
          })   

        }

    };

});