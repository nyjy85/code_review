'use strict';
app.config(function ($stateProvider) {
	$stateProvider.state('home', {
		url: '/home',
		templateUrl: 'js/application/states/home/home.html',
		controller: 'HomeCtrl',
		resolve: {
			Authenticate: function($http, $state) {
				$http.get("http://localhost:1337/session").then(function(res) {
					if (res.data) {
						return
					}
					else {
						$state.go('login')
					}
				});
			}
		}
	});
});

//add Factory
app.controller('HomeCtrl', function ($scope, $state, popupGitFactory) {

  popupGitFactory.getUserInfo().then(function(user) {
		$scope.user = user.user;
		$scope.displayName = $scope.user.github.name;
		console.log(user.user)
	})

	$scope.showRepo = function() {
		console.log('hit controller showRepo')
		var tokenObj = {token: $scope.user.github.token}

		popupGitFactory.getReposToAdd(tokenObj).then(function(repos) {
			$scope.reposToAdd = repos;
		})
	}

	$scope.addRepoToProfile = function (repo) {
		console.log('add repo to profile')
		popupGitFactory.addRepoToProfile($scope.user, repo).then(function(repo) {

		})
	}


})
