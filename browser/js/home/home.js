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
    		console.log("this is in the LANDING controller", response)
    	})
    }

    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;

        AuthService.login(loginInfo).then(function () {
            $state.go('home');
        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });

    };

});
