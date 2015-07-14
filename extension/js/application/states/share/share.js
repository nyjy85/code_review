'use strict';
// app.config(function ($stateProvider) {
// 	$stateProvider.state('file', {
// 		url: '/file',
// 		templateUrl: 'js/application/states/files/file.html',
// 		controller: 'FileCtrl',
// 		resolve: {
// 			Authenticate: function($http, $state) {
// 				$http.get("http://localhost:1337/session").then(function(res) {
// 					if (res.data) {
// 						return
// 					}
// 					else {
// 						$state.go('login')
// 					}
// 				});
// 			}
// 		}
// 	});
// });

//add Factory
app.controller('ShareCtrl', function ($scope, $state, popupGitFactory, $modalInstance, repo, $mdDialog) {

  popupGitFactory.getUserInfo().then(function(user) {
    console.log('hellloooooo', user.github.username)
		$scope.user = user.user;
		$scope.displayName = $scope.user.github.name;

	})
  console.log('repoooo', repo)
	$scope.repoName = repo.name;

	// console.log('from the controller is the repo', repo)

	$scope.shareRepo = function(toUsername) {
    console.log('usernameeee',toUsername, $scope.user);
    repo.contributors.push(toUsername);
    popupGitFactory.shareRepo(toUsername, $scope.user, repo)
  }
    

	$scope.close = function () {
    $modalInstance.close();
  }


})
