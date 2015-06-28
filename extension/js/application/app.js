var app = angular.module('CodeReviewExt', ['ui.router', 'ui.bootstrap']);

app.controller('MainController', function($scope){
	$scope.message = "Check this page out now!";

	$scope.gitLogin = function() {
		chrome.tabs.create({
        url: "http://localhost:1337/auth/github"
    });
	}

})

//What Sarah has for app.config
// app.config(function ($urlRouterProvider, $locationProvider, $compileProvider) {
//     // This turns off hashbang urls (/#about) and changes it to something normal (/about)
//     $locationProvider.html5Mode({
//         enabled: true,
//         requireBase: false
//     });
//     // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
//     $urlRouterProvider.otherwise('/');
//
//
//     // whitelist the chrome-extension: protocol
//     // so that it does not add "unsafe:"
//     $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
//     $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|local|chrome-extension):|data:image\//);
//
// });
