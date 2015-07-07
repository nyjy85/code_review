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

    $scope.getFiles = function(url) {
        console.log('whats uppppssss', url)
        // LandingPageFactory.listFiles()
    }
});
