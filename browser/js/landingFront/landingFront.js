app.config(function ($stateProvider) {
    $stateProvider.state('front', {
        url: '/',
        templateUrl: 'js/landingFront/landingFront.html',
        controller: 'LoginCtrl'
    });
});
