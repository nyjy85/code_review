app.config(function ($stateProvider) {
    $stateProvider.state('front', {
        url: '/frt',
        templateUrl: 'js/landingFront/landingFront.html'
    });
});

app.controller('HomeController', function ($scope) {

	$scope.myInterval = 3000;
	$scope.slides = ['/images/home/home3.jpg', '/images/home/home1.jpg', '/images/home/home2.jpg', '/images/home/home4.jpg'];
});