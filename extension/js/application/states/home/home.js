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
						// $state.go('login')
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
		$scope.showYourRepos = $scope.user.repos;

	})


	$scope.showAddBar = false;

	$scope.showRepoSelections = function() {
		//Load repos to add
		var tokenObj = {token: $scope.user.github.token}
		popupGitFactory.getReposToAdd(tokenObj).then(function(repos) {
			$scope.reposToAdd = repos;
		})

		$scope.showAddBar = !$scope.showAddBar;
	}


	$scope.addRepoToProfile = function (repo) {
		console.log('add repo to profile', $scope.addRepo)
		$scope.showAddBar = !$scope.showAddBar;
		popupGitFactory.addRepoToProfile($scope.user, repo).then(function(res) {
			console.log(res)
		})
	}

	$scope.selectRepo = function(repo) {
		repo.showOptions = !repo.showOptions;
	}

	$scope.goToRepo = function(repo) {
		chrome.tabs.create({
        url: repo.url
    });
	}


})
