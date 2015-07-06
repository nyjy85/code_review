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



    $scope.userInfo = function(user){
    	LandingPageFactory.getUserInfo().then(function(response){
    		console.log("this is in the LANDING controller", response.user)
            LandingPageFactory.getReposToAdd(response.user._id).then(function(res){
                console.log('this is the repos to add', res)
            })
    	})
    }

    $scope.getFiles = function(){
        LandingPageFactory.listFiles()
    }

});
