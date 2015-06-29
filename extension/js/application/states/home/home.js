'use strict';
app.config(function ($stateProvider) {
	$stateProvider.state('mainPage', {
		url: '/mainPage',
		templateUrl: 'js/application/states/mainPage/mainPage.html',
		controller: 'mainPageCtrl'
	});
});

//add Factory
app.controller('mainPageCtrl', function ($scope) {

  //isAuthenticated.

  // $scope.displayName = 

  // UserFactory.getTotalPoints().then(function(points){
	// 	$scope.manyPoints = points
	// })

})
