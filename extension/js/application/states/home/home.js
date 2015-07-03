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
app.controller('HomeCtrl', function ($scope, $state, popupGitFactory, $timeout, $mdSidenav, $mdUtil, $log, $modal) {

  popupGitFactory.getUserInfo().then(function(user) {
		$scope.user = user.user;
		$scope.showYourRepos = $scope.user.repos;

		$scope.loadRepos();

	})

	$scope.loadRepos = function () {
		var tokenObj = {token: $scope.user.github.token};
		popupGitFactory.getReposToAdd(tokenObj).then(function(repos) {
				$scope.reposToAdd = repos;
		}).catch($log.log.bind($log));
	}


	$scope.toggleAddBar = function () {
		$scope.showAddBar = !$scope.showAddBar;
	}

	$scope.addingRepo = function(repo) {
		$scope.addRepo = repo;
	}

	$scope.addRepoToProfile = function () {
		console.log('add repo to profile')

		$scope.user.repos.push($scope.addRepo);

		popupGitFactory.addRepoToProfile($scope.user).then(function(res) {
			console.log(res)
		})

		$scope.loadRepos();
	}

	$scope.selectRepo = function(repo) {
		repo.showOptions = !repo.showOptions;
	}

	//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!WHY U NO FUCKING WORK
	$scope.deleteRepo = function(repo) {
		console.log('deleting repo', repo, $scope.user.repos)
		//update user repo

		$scope.user.repos.forEach(function(userrepo, i) {
			console.log('hello userrepo',userrepo)
			console.log('hello repo',repo)
			if (userrepo.name === repo.name) $scope.user.repos.splice(i,1);
		})

		popupGitFactory.deleteRepo($scope.user).then(function(res) {
			console.log('deleted repo', res)
		})
	}

	$scope.goToRepo = function(repo) {
		chrome.tabs.create({
        url: repo.url
    });
	}

	$scope.listFiles = function(repo) {

		var modalInstance = $modal.open({
      templateUrl: 'js/application/states/files/file.html',
      controller: 'FileCtrl',
      resolve: {
        repo: function() {
          return repo;
        }
      }
    });


	}



	//sidebar
	$scope.toggleLeft = buildToggler('left');

	function buildToggler(navID) {
      var debounceFn =  $mdUtil.debounce(function(){
            $mdSidenav(navID)
              .toggle()
              .then(function () {
                $log.debug("toggle " + navID + " is done");
              });
          },300);
      return debounceFn;
  }

	$scope.close = function () {
      $mdSidenav('left').close()
        .then(function () {
          $log.debug("close LEFT is done");
        });
  };

})
