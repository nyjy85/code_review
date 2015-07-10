app.config(function ($stateProvider) {
    $stateProvider.state('front', {
        url: '/frt',
        templateUrl: 'js/landingFront/landingFront.html',
        controller: 'LoginCtrl'
    });
});
