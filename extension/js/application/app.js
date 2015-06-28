var app = angular.module('CodeReviewExt', ['ui.router', 'ui.bootstrap']);

app.controller('MainController', function($scope){
	$scope.message = "Check this page out now!";
})