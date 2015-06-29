'use strict';
app.config(function ($stateProvider) {
	$stateProvider.state('home', {
		url: '/home',
		templateUrl: 'js/application/states/home/home.html',
		controller: 'HomeCtrl'
	});
});

//add Factory
app.controller('HomeCtrl', function ($scope) {

  //isAuthenticated.

  // $scope.displayName =

  // UserFactory.getTotalPoints().then(function(points){
	// 	$scope.manyPoints = points
	// })

})
