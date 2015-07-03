var app = angular.module('CodeReviewExt', ['ui.router', 'ui.bootstrap', 'ngMaterial']);


app.config(function ($urlRouterProvider, $locationProvider, $compileProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');


    // whitelist the chrome-extension: protocol
    // so that it does not add "unsafe:"
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|local|chrome-extension):|data:image\//);

});

app.factory('popupGitFactory', function($http) {
    var domain = "http://localhost:1337";

    return {
        // getAllProds: function() {
        //     //gets list of all available products from store
        //     return $http.get(domain.path + '/api/store/').then(function(res) {
        //         return res.data;
        //     });
        // },
        getUserInfo: function() {
          return $http.get(domain + "/session").then(function(res){
            return res.data; //res.data.user
          });
        },

        getReposToAdd: function(token) {
          console.log('hit getrepo', token)
          return $http.get(domain + "/api/git/reposFromGit", {params: token})
          .then(function(res) {
            return res.data;
          })
        },

        addRepoToProfile: function(user) {
          console.log('addRepoToProfile factory',user.repos)
          var repo = {repo: user.repos}
          return $http.put(domain + "/api/users/addRepo/" + user.github.username, repo)
          .then(function(res) {
            return res.data;
          })

          // var repo = {repo: {url: repo.html_url, name: repo.name}}
          // return $http.put(domain + "/api/users/addRepo/" + user.github.username, repo)
          // .then(function(res) {
          //   return res.data;
          // })
        },

        deleteRepo: function(user) {
          console.log('deleting repo', user.repos)
          var repo = {repo: user.repos}
          return $http.put(domain + '/api/users/deleteRepo/' + user.github.username, repo)
          .then(function(res) {
            return res.data;
          })
        },

        listFiles: function(repo) {
          console.log('list file names under the repo', repo)
          return $http.get(domain + "/api/file/repo/" + repo.name)
          .then(function(res) {
            return res.data;
          })
        }

    }
});


//extension on
//tab bar
//

// 'use strict';
// app.directive('sidebar', function ($rootScope, $state, popupGitFactory, $timeout, $mdSidenav, $log) {
//
//     return {
//         restrict: 'E',
//         scope: {},
//         templateUrl: 'js/common/directives/sidebar/sidebar.html',
//         link: function (scope) {
//
//           scope.close = function () {
//           $mdSidenav('right').close()
//             .then(function () {
//               $log.debug("close LEFT is done");
//             });
//           };
//
//         }
//     }
//
//   }
// });

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
app.controller('FileCtrl', function ($scope, $state, popupGitFactory, $modalInstance, repo) {

  popupGitFactory.getUserInfo().then(function(user) {
		$scope.user = user.user;
		$scope.displayName = $scope.user.github.name;

	})

	$scope.repoName = repo.name;

	popupGitFactory.listFiles(repo).then(function(files){
		console.log('list files', files)
		$scope.filesUnderRepo = files;
	})

	// $scope.showYourFiles = $scope.user.repos;

	$scope.goToFile = function(file) {
		chrome.tabs.create({
        url: file.url
    });
	}


})



// https://github.com/nyjy85/code_review/commit/4e0f7ec33539804316dfff786b80be86de672ea4
// https://github.com/nyjy85/code_review/blob/rightClick/browser/scss/home/main.scss

// Branch: rightClick
// Repo Name: code_review
// Files: /browser/scss/home/main.scss

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

app.config(function ($stateProvider) {
	$stateProvider.state('login', {
		url: '/',
		templateUrl: 'js/application/states/login/login.html',
		controller: 'LoginController',
		resolve: {
			Login: function($http, $state) {
				$http.get("http://localhost:1337/session").then(function(res) {
					if(res.data) {
						$state.go('home')
					}
					else {
						return
					}
				});
			}
		}
	});
});

app.controller('LoginController', function($scope, $state, popupGitFactory){
  $scope.message = "Check this page out now!";

	// $scope.loggedin = false;

	$scope.gitLogin = function() {
		//need to change localhost:1337 to the appropriate domain name after deployment!!!
		console.log('gitLogin')
		$scope.SuccessfulLogin();
		chrome.tabs.create({
        url: "http://localhost:1337/auth/github"
    });

	}


	// console.log(session)


	$scope.SuccessfulLogin = function() {
		console.log('successuflly loggin')

		$state.go('home')
		getName();
		// $scope.loggedin = true;
	}

	var getName = function() {
		popupGitFactory.getUserInfo().then(function(data) {
			console.log('getName', data);
			// $scope.name =
		})
	}
})

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZhY3Rvcmllcy9wb3B1cEdpdEZhY3RvcnkuanMiLCJkaXJlY3RpdmVzL3NpZGViYXIvc2lkZWJhci5qcyIsInN0YXRlcy9maWxlcy9maWxlLmpzIiwic3RhdGVzL2hvbWUvaG9tZS5qcyIsInN0YXRlcy9sb2dpbi9sb2dpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnQ29kZVJldmlld0V4dCcsIFsndWkucm91dGVyJywgJ3VpLmJvb3RzdHJhcCcsICduZ01hdGVyaWFsJ10pO1xuXG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsICRjb21waWxlUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHtcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZUJhc2U6IGZhbHNlXG4gICAgfSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG5cbiAgICAvLyB3aGl0ZWxpc3QgdGhlIGNocm9tZS1leHRlbnNpb246IHByb3RvY29sXG4gICAgLy8gc28gdGhhdCBpdCBkb2VzIG5vdCBhZGQgXCJ1bnNhZmU6XCJcbiAgICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3xjaHJvbWUtZXh0ZW5zaW9uKTovKTtcbiAgICAkY29tcGlsZVByb3ZpZGVyLmltZ1NyY1Nhbml0aXphdGlvbldoaXRlbGlzdCgvXlxccyooaHR0cHM/fGZ0cHxmaWxlfGxvY2FsfGNocm9tZS1leHRlbnNpb24pOnxkYXRhOmltYWdlXFwvLyk7XG5cbn0pO1xuIiwiYXBwLmZhY3RvcnkoJ3BvcHVwR2l0RmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgdmFyIGRvbWFpbiA9IFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3XCI7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICAvLyBnZXRBbGxQcm9kczogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICAgICAvL2dldHMgbGlzdCBvZiBhbGwgYXZhaWxhYmxlIHByb2R1Y3RzIGZyb20gc3RvcmVcbiAgICAgICAgLy8gICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluLnBhdGggKyAnL2FwaS9zdG9yZS8nKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAvLyAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9LFxuICAgICAgICBnZXRVc2VySW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9zZXNzaW9uXCIpLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTsgLy9yZXMuZGF0YS51c2VyXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0UmVwb3NUb0FkZDogZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnaGl0IGdldHJlcG8nLCB0b2tlbilcbiAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGRvbWFpbiArIFwiL2FwaS9naXQvcmVwb3NGcm9tR2l0XCIsIHtwYXJhbXM6IHRva2VufSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGFkZFJlcG9Ub1Byb2ZpbGU6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnYWRkUmVwb1RvUHJvZmlsZSBmYWN0b3J5Jyx1c2VyLnJlcG9zKVxuICAgICAgICAgIHZhciByZXBvID0ge3JlcG86IHVzZXIucmVwb3N9XG4gICAgICAgICAgcmV0dXJuICRodHRwLnB1dChkb21haW4gKyBcIi9hcGkvdXNlcnMvYWRkUmVwby9cIiArIHVzZXIuZ2l0aHViLnVzZXJuYW1lLCByZXBvKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG5cbiAgICAgICAgICAvLyB2YXIgcmVwbyA9IHtyZXBvOiB7dXJsOiByZXBvLmh0bWxfdXJsLCBuYW1lOiByZXBvLm5hbWV9fVxuICAgICAgICAgIC8vIHJldHVybiAkaHR0cC5wdXQoZG9tYWluICsgXCIvYXBpL3VzZXJzL2FkZFJlcG8vXCIgKyB1c2VyLmdpdGh1Yi51c2VybmFtZSwgcmVwbylcbiAgICAgICAgICAvLyAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAvLyAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAvLyB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGRlbGV0ZVJlcG86IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnZGVsZXRpbmcgcmVwbycsIHVzZXIucmVwb3MpXG4gICAgICAgICAgdmFyIHJlcG8gPSB7cmVwbzogdXNlci5yZXBvc31cbiAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KGRvbWFpbiArICcvYXBpL3VzZXJzL2RlbGV0ZVJlcG8vJyArIHVzZXIuZ2l0aHViLnVzZXJuYW1lLCByZXBvKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgbGlzdEZpbGVzOiBmdW5jdGlvbihyZXBvKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2xpc3QgZmlsZSBuYW1lcyB1bmRlciB0aGUgcmVwbycsIHJlcG8pXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9hcGkvZmlsZS9yZXBvL1wiICsgcmVwby5uYW1lKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgIH1cbn0pO1xuXG5cbi8vZXh0ZW5zaW9uIG9uXG4vL3RhYiBiYXJcbi8vXG4iLCIvLyAndXNlIHN0cmljdCc7XG4vLyBhcHAuZGlyZWN0aXZlKCdzaWRlYmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzdGF0ZSwgcG9wdXBHaXRGYWN0b3J5LCAkdGltZW91dCwgJG1kU2lkZW5hdiwgJGxvZykge1xuLy9cbi8vICAgICByZXR1cm4ge1xuLy8gICAgICAgICByZXN0cmljdDogJ0UnLFxuLy8gICAgICAgICBzY29wZToge30sXG4vLyAgICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvc2lkZWJhci9zaWRlYmFyLmh0bWwnLFxuLy8gICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcbi8vXG4vLyAgICAgICAgICAgc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAgICAgJG1kU2lkZW5hdigncmlnaHQnKS5jbG9zZSgpXG4vLyAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAgICAgICAgICRsb2cuZGVidWcoXCJjbG9zZSBMRUZUIGlzIGRvbmVcIik7XG4vLyAgICAgICAgICAgICB9KTtcbi8vICAgICAgICAgICB9O1xuLy9cbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vXG4vLyAgIH1cbi8vIH0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLy8gYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbi8vIFx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2ZpbGUnLCB7XG4vLyBcdFx0dXJsOiAnL2ZpbGUnLFxuLy8gXHRcdHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2ZpbGVzL2ZpbGUuaHRtbCcsXG4vLyBcdFx0Y29udHJvbGxlcjogJ0ZpbGVDdHJsJyxcbi8vIFx0XHRyZXNvbHZlOiB7XG4vLyBcdFx0XHRBdXRoZW50aWNhdGU6IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcbi8vIFx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcbi8vIFx0XHRcdFx0XHRpZiAocmVzLmRhdGEpIHtcbi8vIFx0XHRcdFx0XHRcdHJldHVyblxuLy8gXHRcdFx0XHRcdH1cbi8vIFx0XHRcdFx0XHRlbHNlIHtcbi8vIFx0XHRcdFx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKVxuLy8gXHRcdFx0XHRcdH1cbi8vIFx0XHRcdFx0fSk7XG4vLyBcdFx0XHR9XG4vLyBcdFx0fVxuLy8gXHR9KTtcbi8vIH0pO1xuXG4vL2FkZCBGYWN0b3J5XG5hcHAuY29udHJvbGxlcignRmlsZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJG1vZGFsSW5zdGFuY2UsIHJlcG8pIHtcblxuICBwb3B1cEdpdEZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcblx0XHQkc2NvcGUudXNlciA9IHVzZXIudXNlcjtcblx0XHQkc2NvcGUuZGlzcGxheU5hbWUgPSAkc2NvcGUudXNlci5naXRodWIubmFtZTtcblxuXHR9KVxuXG5cdCRzY29wZS5yZXBvTmFtZSA9IHJlcG8ubmFtZTtcblxuXHRwb3B1cEdpdEZhY3RvcnkubGlzdEZpbGVzKHJlcG8pLnRoZW4oZnVuY3Rpb24oZmlsZXMpe1xuXHRcdGNvbnNvbGUubG9nKCdsaXN0IGZpbGVzJywgZmlsZXMpXG5cdFx0JHNjb3BlLmZpbGVzVW5kZXJSZXBvID0gZmlsZXM7XG5cdH0pXG5cblx0Ly8gJHNjb3BlLnNob3dZb3VyRmlsZXMgPSAkc2NvcGUudXNlci5yZXBvcztcblxuXHQkc2NvcGUuZ29Ub0ZpbGUgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0Y2hyb21lLnRhYnMuY3JlYXRlKHtcbiAgICAgICAgdXJsOiBmaWxlLnVybFxuICAgIH0pO1xuXHR9XG5cblxufSlcblxuXG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ueWp5ODUvY29kZV9yZXZpZXcvY29tbWl0LzRlMGY3ZWMzMzUzOTgwNDMxNmRmZmY3ODZiODBiZTg2ZGU2NzJlYTRcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ueWp5ODUvY29kZV9yZXZpZXcvYmxvYi9yaWdodENsaWNrL2Jyb3dzZXIvc2Nzcy9ob21lL21haW4uc2Nzc1xuXG4vLyBCcmFuY2g6IHJpZ2h0Q2xpY2tcbi8vIFJlcG8gTmFtZTogY29kZV9yZXZpZXdcbi8vIEZpbGVzOiAvYnJvd3Nlci9zY3NzL2hvbWUvbWFpbi5zY3NzXG4iLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcblx0XHR1cmw6ICcvaG9tZScsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvaG9tZS9ob21lLmh0bWwnLFxuXHRcdGNvbnRyb2xsZXI6ICdIb21lQ3RybCcsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0QXV0aGVudGljYXRlOiBmdW5jdGlvbigkaHR0cCwgJHN0YXRlKSB7XG5cdFx0XHRcdCRodHRwLmdldChcImh0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9zZXNzaW9uXCIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdFx0aWYgKHJlcy5kYXRhKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyAkc3RhdGUuZ28oJ2xvZ2luJylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59KTtcblxuLy9hZGQgRmFjdG9yeVxuYXBwLmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlLCBwb3B1cEdpdEZhY3RvcnksICR0aW1lb3V0LCAkbWRTaWRlbmF2LCAkbWRVdGlsLCAkbG9nLCAkbW9kYWwpIHtcblxuICBwb3B1cEdpdEZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcblx0XHQkc2NvcGUudXNlciA9IHVzZXIudXNlcjtcblx0XHQkc2NvcGUuc2hvd1lvdXJSZXBvcyA9ICRzY29wZS51c2VyLnJlcG9zO1xuXG5cdFx0JHNjb3BlLmxvYWRSZXBvcygpO1xuXG5cdH0pXG5cblx0JHNjb3BlLmxvYWRSZXBvcyA9IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgdG9rZW5PYmogPSB7dG9rZW46ICRzY29wZS51c2VyLmdpdGh1Yi50b2tlbn07XG5cdFx0cG9wdXBHaXRGYWN0b3J5LmdldFJlcG9zVG9BZGQodG9rZW5PYmopLnRoZW4oZnVuY3Rpb24ocmVwb3MpIHtcblx0XHRcdFx0JHNjb3BlLnJlcG9zVG9BZGQgPSByZXBvcztcblx0XHR9KS5jYXRjaCgkbG9nLmxvZy5iaW5kKCRsb2cpKTtcblx0fVxuXG5cblx0JHNjb3BlLnRvZ2dsZUFkZEJhciA9IGZ1bmN0aW9uICgpIHtcblx0XHQkc2NvcGUuc2hvd0FkZEJhciA9ICEkc2NvcGUuc2hvd0FkZEJhcjtcblx0fVxuXG5cdCRzY29wZS5hZGRpbmdSZXBvID0gZnVuY3Rpb24ocmVwbykge1xuXHRcdCRzY29wZS5hZGRSZXBvID0gcmVwbztcblx0fVxuXG5cdCRzY29wZS5hZGRSZXBvVG9Qcm9maWxlID0gZnVuY3Rpb24gKCkge1xuXHRcdGNvbnNvbGUubG9nKCdhZGQgcmVwbyB0byBwcm9maWxlJylcblxuXHRcdCRzY29wZS51c2VyLnJlcG9zLnB1c2goJHNjb3BlLmFkZFJlcG8pO1xuXG5cdFx0cG9wdXBHaXRGYWN0b3J5LmFkZFJlcG9Ub1Byb2ZpbGUoJHNjb3BlLnVzZXIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhyZXMpXG5cdFx0fSlcblxuXHRcdCRzY29wZS5sb2FkUmVwb3MoKTtcblx0fVxuXG5cdCRzY29wZS5zZWxlY3RSZXBvID0gZnVuY3Rpb24ocmVwbykge1xuXHRcdHJlcG8uc2hvd09wdGlvbnMgPSAhcmVwby5zaG93T3B0aW9ucztcblx0fVxuXG5cdC8vISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhIVdIWSBVIE5PIEZVQ0tJTkcgV09SS1xuXHQkc2NvcGUuZGVsZXRlUmVwbyA9IGZ1bmN0aW9uKHJlcG8pIHtcblx0XHRjb25zb2xlLmxvZygnZGVsZXRpbmcgcmVwbycsIHJlcG8sICRzY29wZS51c2VyLnJlcG9zKVxuXHRcdC8vdXBkYXRlIHVzZXIgcmVwb1xuXG5cdFx0JHNjb3BlLnVzZXIucmVwb3MuZm9yRWFjaChmdW5jdGlvbih1c2VycmVwbywgaSkge1xuXHRcdFx0Y29uc29sZS5sb2coJ2hlbGxvIHVzZXJyZXBvJyx1c2VycmVwbylcblx0XHRcdGNvbnNvbGUubG9nKCdoZWxsbyByZXBvJyxyZXBvKVxuXHRcdFx0aWYgKHVzZXJyZXBvLm5hbWUgPT09IHJlcG8ubmFtZSkgJHNjb3BlLnVzZXIucmVwb3Muc3BsaWNlKGksMSk7XG5cdFx0fSlcblxuXHRcdHBvcHVwR2l0RmFjdG9yeS5kZWxldGVSZXBvKCRzY29wZS51c2VyKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0Y29uc29sZS5sb2coJ2RlbGV0ZWQgcmVwbycsIHJlcylcblx0XHR9KVxuXHR9XG5cblx0JHNjb3BlLmdvVG9SZXBvID0gZnVuY3Rpb24ocmVwbykge1xuXHRcdGNocm9tZS50YWJzLmNyZWF0ZSh7XG4gICAgICAgIHVybDogcmVwby51cmxcbiAgICB9KTtcblx0fVxuXG5cdCRzY29wZS5saXN0RmlsZXMgPSBmdW5jdGlvbihyZXBvKSB7XG5cblx0XHR2YXIgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2ZpbGVzL2ZpbGUuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnRmlsZUN0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICByZXBvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gcmVwbztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG5cblx0fVxuXG5cblxuXHQvL3NpZGViYXJcblx0JHNjb3BlLnRvZ2dsZUxlZnQgPSBidWlsZFRvZ2dsZXIoJ2xlZnQnKTtcblxuXHRmdW5jdGlvbiBidWlsZFRvZ2dsZXIobmF2SUQpIHtcbiAgICAgIHZhciBkZWJvdW5jZUZuID0gICRtZFV0aWwuZGVib3VuY2UoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICRtZFNpZGVuYXYobmF2SUQpXG4gICAgICAgICAgICAgIC50b2dnbGUoKVxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZyhcInRvZ2dsZSBcIiArIG5hdklEICsgXCIgaXMgZG9uZVwiKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSwzMDApO1xuICAgICAgcmV0dXJuIGRlYm91bmNlRm47XG4gIH1cblxuXHQkc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkbWRTaWRlbmF2KCdsZWZ0JykuY2xvc2UoKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJGxvZy5kZWJ1ZyhcImNsb3NlIExFRlQgaXMgZG9uZVwiKTtcbiAgICAgICAgfSk7XG4gIH07XG5cbn0pXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XG5cdFx0dXJsOiAnLycsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvbG9naW4vbG9naW4uaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ0xvZ2luQ29udHJvbGxlcicsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0TG9naW46IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcblx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0XHRpZihyZXMuZGF0YSkge1xuXHRcdFx0XHRcdFx0JHN0YXRlLmdvKCdob21lJylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCBwb3B1cEdpdEZhY3Rvcnkpe1xuICAkc2NvcGUubWVzc2FnZSA9IFwiQ2hlY2sgdGhpcyBwYWdlIG91dCBub3chXCI7XG5cblx0Ly8gJHNjb3BlLmxvZ2dlZGluID0gZmFsc2U7XG5cblx0JHNjb3BlLmdpdExvZ2luID0gZnVuY3Rpb24oKSB7XG5cdFx0Ly9uZWVkIHRvIGNoYW5nZSBsb2NhbGhvc3Q6MTMzNyB0byB0aGUgYXBwcm9wcmlhdGUgZG9tYWluIG5hbWUgYWZ0ZXIgZGVwbG95bWVudCEhIVxuXHRcdGNvbnNvbGUubG9nKCdnaXRMb2dpbicpXG5cdFx0JHNjb3BlLlN1Y2Nlc3NmdWxMb2dpbigpO1xuXHRcdGNocm9tZS50YWJzLmNyZWF0ZSh7XG4gICAgICAgIHVybDogXCJodHRwOi8vbG9jYWxob3N0OjEzMzcvYXV0aC9naXRodWJcIlxuICAgIH0pO1xuXG5cdH1cblxuXG5cdC8vIGNvbnNvbGUubG9nKHNlc3Npb24pXG5cblxuXHQkc2NvcGUuU3VjY2Vzc2Z1bExvZ2luID0gZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coJ3N1Y2Nlc3N1ZmxseSBsb2dnaW4nKVxuXG5cdFx0JHN0YXRlLmdvKCdob21lJylcblx0XHRnZXROYW1lKCk7XG5cdFx0Ly8gJHNjb3BlLmxvZ2dlZGluID0gdHJ1ZTtcblx0fVxuXG5cdHZhciBnZXROYW1lID0gZnVuY3Rpb24oKSB7XG5cdFx0cG9wdXBHaXRGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnZ2V0TmFtZScsIGRhdGEpO1xuXHRcdFx0Ly8gJHNjb3BlLm5hbWUgPVxuXHRcdH0pXG5cdH1cbn0pXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=