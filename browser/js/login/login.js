// app.config(function ($stateProvider) {

//     $stateProvider.state('login', {
//         url: '/login',
//         templateUrl: 'js/login/login.html',
//         controller: 'LoginCtrl'
//     });

// });

app.controller('LoginCtrl', function ($scope, AuthService, $state) {

    $scope.login = {};
    $scope.error = null;

    $scope.gitLogin = function() {
        //need to change localhost:1337 to the appropriate domain name after deployment!!!
        console.log('gitLogin')
        AuthService.gitLogin();
    }

    $scope.logout = function() {
        AuthService.logout().then(function () {
           console.log('why')
           $state.go('front');
        });
    }

});
