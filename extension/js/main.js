var app = angular.module('CodeReviewExt', ['ui.router', 'ui.bootstrap', 'ngMaterial']);


app.config(function ($mdIconProvider, $urlRouterProvider, $locationProvider, $compileProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');

    $mdIconProvider
    .iconSet("call", 'img/icons/communication-icons.svg', 24)
    .iconSet("social", 'img/icons/social-icons.svg', 24);


    // whitelist the chrome-extension: protocol
    // so that it does not add "unsafe:"
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|local|chrome-extension):|data:image\//);

});



app.factory('popupGitFactory', function($http) {
    var domain = "http://localhost:1337";

    return {

        getUserInfo: function() {
          return $http.get(domain + "/session").then(function(res){
            return res.data; //res.data.user
          });
        },

        getReposToAdd: function(token) {
          console.log('hit getrepo', token)
          return $http.get(domain + "/api/git", {params: token})
          .then(function(res) {
            return res.data;
          })
        },

        getContributors: function(contributorUrl) {
          var i = contributorUrl.match(/repos/).index + 6;
          var repoUrl = contributorUrl.slice(i, -13);
          var owner = repoUrl.split('/')[0];
          var repo = repoUrl.split('/')[1];

          console.log('!!!!!',i , repoUrl, owner, repo)
          return $http.get(domain + "/api/git/repos/" + owner + '/' + repo + '/contributors')
          .then(function(res) {
            return res.data;
          })
        },

        //adding or deleting repo from profile
        editRepo: function(user) {
          console.log('addRepoToProfile factory',user.repos)
          var repo = {repo: user.repos}
          return $http.put(domain + "/api/users/" + user.github.username + "/editRepo", repo)
          .then(function(res) {
            return res.data;
          })
        },

        archiveRepo: function(user) {
          console.log('archieve repo factory', user.archives);
          var archives = {repo: user.archives}
          return $http.put(domain + '/api/users/' + user.github.username + '/archiveRepo', archives)
          .then(function(res) {
            return res.data;
          })
        },

        listFiles: function(repo) {
          console.log('list file names under the repo', repo)
          return $http.get(domain + "/api/repo/all", {params: repo})
          .then(function(res) {
            return res.data;
          })
        },

        repoFindOrInsert: function(repo) {
          console.log('is there such repo? factory', repo)
          return $http.get(domain + "/api/repo/", {params: repo})
          .then(function(res){
            return res.data;
          })
        },

        logout: function() {
          console.log('hitting the factory')
          return $http.get(domain +'/logout').then(function () {
      			//this needs a logic remap
            	console.log('logged out');
      		});
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
app.config(function ($stateProvider) {
	$stateProvider.state('archive', {
		url: '/archive',
		templateUrl: 'js/application/states/archive/archive.html',
		controller: 'ArchiveCtrl',
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
app.controller('ArchiveCtrl', function ($scope, $state, popupGitFactory, $mdDialog) {

  popupGitFactory.getUserInfo().then(function(user) {
		$scope.user = user.user;
    $scope.showArch = $scope.user.archives;
	})



})

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
app.controller('FileCtrl', function ($scope, $state, popupGitFactory, $modalInstance, repo, $mdDialog) {

  popupGitFactory.getUserInfo().then(function(user) {
		$scope.user = user.user;
		$scope.displayName = $scope.user.github.name;

	})

	$scope.repoName = repo.name;
	console.log('from the controller is the repo', repo)

	popupGitFactory.listFiles(repo).then(function(repo){
        console.log('list files', repo)
        repo.files.forEach(function(file) {
            var url = file.fileUrl;
            var i = url.match(/blob/).index + 5;
            file.display = url.slice(i);
        })
        $scope.filesUnderRepo = repo.files;
    })

	// $scope.showYourFiles = $scope.user.repos;

	$scope.goToFile = function(file) {
		chrome.tabs.create({
        url: file.fileUrl
    });
	}

	$scope.close = function () {
    $modalInstance.close();
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
						$state.go('login')
					}
				});
			}
		}
	});
});

//add Factory
app.controller('HomeCtrl', function ($scope, $state, popupGitFactory, $timeout, $mdSidenav, $mdUtil, $log, $modal, $mdDialog) {

  popupGitFactory.getUserInfo().then(function(user) {
		$scope.user = user.user;
		console.log('user', $scope.user)
		$scope.tokenObj = {token: $scope.user.github.token};
		console.log('current user', $scope.user)
		$scope.showRepos = $scope.user.repos;
		$scope.loadRepos();
	})

	$scope.loadRepos = function () {
		popupGitFactory.getReposToAdd($scope.tokenObj)
		.then(function(repos) {
				$scope.reposToAdd = repos;
		}).catch($log.log.bind($log));
	}


	$scope.toggleAddBar = function () {
		$scope.showAddBar = !$scope.showAddBar;
	}


	var cannotAddBox = function () {
		$mdDialog.show(
		$mdDialog.alert()
			.parent(angular.element(document.body))
			.title('Unfortunately')
			.content('You cannot add a repo you already added.')
			.ok('Got it!')
		);
	}

	$scope.addRepo = function (repo) {
		console.log('adding repo', repo)

		// // checking if repo exist
		// var check;
		// $scope.showRepos.forEach(function(current) {
		// 	if (current.name === repo.name) {
		// 		check = true;
		// 		cannotAddBox();
		// 	}
		// });

		// add repo if repo doesn't exist in user.db
		// if (!check) {

			popupGitFactory.getContributors(repo.contributors_url)
			.then(function(names) {
				console.log('names', names)
				repo.contributors = names;

				var saverepo = {name: repo.name, url: repo.html_url, contributors: repo.contributors}
				console.log(saverepo)

				//create Repo if it doesn't exist in the Repo.db
				popupGitFactory.repoFindOrInsert(saverepo).then(function(resData) {
					console.log('check if there is such repo', resData)


				})

				// //adding repo_id to user.repo array in the User.db
				// $scope.user.repos.push(repo._id);

			})
		// };

	}

	$scope.deleteRepo = function(repo) {
		console.log('deleting repo')

		var confirm = $mdDialog.confirm()
      .parent(angular.element(document.body))
      .title('Confirm')
      .content('Would you like to delete this repo?')
      .ok('Yes!')
      .cancel('No!');

		$mdDialog.show(confirm).then(function() {
			//after confirm delete
			$scope.user.repos.forEach(function(userrepo, i) {
				if (userrepo._id === repo._id) $scope.user.repos.splice(i,1);
			})
			popupGitFactory.editRepo($scope.user).then(function(res) {
				console.log('deleted repo', res)
			})

    });

	}

	$scope.goArchive = function() {
		$state.go('archive');
	}

	$scope.archiveRepo = function(repo) {
		var confirm = $mdDialog.confirm()
      .parent(angular.element(document.body))
      .title('Confirm')
      .content('Would you like to archive this repo?')
      .ok('Yes!')
      .cancel('No!');

		$mdDialog.show(confirm).then(function() {
			//after confirm to archive
			//add repo to user.archives
			$scope.user.archives.push(repo);
			console.log($scope.user.archives);
			popupGitFactory.archiveRepo($scope.user).then(function(res) {
				console.log('archived to db', res)
			})

			//delete repo from user.repos
			$scope.user.repos.forEach(function(userrepo, i) {
				if (userrepo._id === repo._id) $scope.user.repos.splice(i,1);
			})
			popupGitFactory.editRepo($scope.user).then(function(res) {
				console.log('deleted repo', res)
			})

    });

  // };
		// $scope.user.repos.forEach(function(userrepo, i){})
	}

	$scope.goToRepo = function(repo) {
		chrome.tabs.create({
        url: repo.url
    });
	}

	//list files under a repo
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

	//log out
	$scope.logout = function () {
		popupGitFactory.logout().then(function(){
			$state.go('login');
		})
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZhY3Rvcmllcy9wb3B1cEdpdEZhY3RvcnkuanMiLCJkaXJlY3RpdmVzL3NpZGViYXIvc2lkZWJhci5qcyIsImRpcmVjdGl2ZXMvc2V0dGluZ0J1dHRvbi9zZXR0aW5nQnV0dG9uLmpzIiwic3RhdGVzL2FyY2hpdmUvYXJjaGl2ZS5qcyIsInN0YXRlcy9maWxlcy9maWxlLmpzIiwic3RhdGVzL2hvbWUvaG9tZS5qcyIsInN0YXRlcy9sb2dpbi9sb2dpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ0NvZGVSZXZpZXdFeHQnLCBbJ3VpLnJvdXRlcicsICd1aS5ib290c3RyYXAnLCAnbmdNYXRlcmlhbCddKTtcblxuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkbWRJY29uUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsICRjb21waWxlUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHtcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZUJhc2U6IGZhbHNlXG4gICAgfSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG4gICAgJG1kSWNvblByb3ZpZGVyXG4gICAgLmljb25TZXQoXCJjYWxsXCIsICdpbWcvaWNvbnMvY29tbXVuaWNhdGlvbi1pY29ucy5zdmcnLCAyNClcbiAgICAuaWNvblNldChcInNvY2lhbFwiLCAnaW1nL2ljb25zL3NvY2lhbC1pY29ucy5zdmcnLCAyNCk7XG5cblxuICAgIC8vIHdoaXRlbGlzdCB0aGUgY2hyb21lLWV4dGVuc2lvbjogcHJvdG9jb2xcbiAgICAvLyBzbyB0aGF0IGl0IGRvZXMgbm90IGFkZCBcInVuc2FmZTpcIlxuICAgICRjb21waWxlUHJvdmlkZXIuYUhyZWZTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8bWFpbHRvfGNocm9tZS1leHRlbnNpb24pOi8pO1xuICAgICRjb21waWxlUHJvdmlkZXIuaW1nU3JjU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfGZpbGV8bG9jYWx8Y2hyb21lLWV4dGVuc2lvbik6fGRhdGE6aW1hZ2VcXC8vKTtcblxufSk7XG5cblxuIiwiYXBwLmZhY3RvcnkoJ3BvcHVwR2l0RmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgdmFyIGRvbWFpbiA9IFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3XCI7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIGdldFVzZXJJbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGRvbWFpbiArIFwiL3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhOyAvL3Jlcy5kYXRhLnVzZXJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRSZXBvc1RvQWRkOiBmdW5jdGlvbih0b2tlbikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdoaXQgZ2V0cmVwbycsIHRva2VuKVxuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgXCIvYXBpL2dpdFwiLCB7cGFyYW1zOiB0b2tlbn0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDb250cmlidXRvcnM6IGZ1bmN0aW9uKGNvbnRyaWJ1dG9yVXJsKSB7XG4gICAgICAgICAgdmFyIGkgPSBjb250cmlidXRvclVybC5tYXRjaCgvcmVwb3MvKS5pbmRleCArIDY7XG4gICAgICAgICAgdmFyIHJlcG9VcmwgPSBjb250cmlidXRvclVybC5zbGljZShpLCAtMTMpO1xuICAgICAgICAgIHZhciBvd25lciA9IHJlcG9Vcmwuc3BsaXQoJy8nKVswXTtcbiAgICAgICAgICB2YXIgcmVwbyA9IHJlcG9Vcmwuc3BsaXQoJy8nKVsxXTtcblxuICAgICAgICAgIGNvbnNvbGUubG9nKCchISEhIScsaSAsIHJlcG9VcmwsIG93bmVyLCByZXBvKVxuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgXCIvYXBpL2dpdC9yZXBvcy9cIiArIG93bmVyICsgJy8nICsgcmVwbyArICcvY29udHJpYnV0b3JzJylcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vYWRkaW5nIG9yIGRlbGV0aW5nIHJlcG8gZnJvbSBwcm9maWxlXG4gICAgICAgIGVkaXRSZXBvOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2FkZFJlcG9Ub1Byb2ZpbGUgZmFjdG9yeScsdXNlci5yZXBvcylcbiAgICAgICAgICB2YXIgcmVwbyA9IHtyZXBvOiB1c2VyLnJlcG9zfVxuICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoZG9tYWluICsgXCIvYXBpL3VzZXJzL1wiICsgdXNlci5naXRodWIudXNlcm5hbWUgKyBcIi9lZGl0UmVwb1wiLCByZXBvKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgYXJjaGl2ZVJlcG86IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnYXJjaGlldmUgcmVwbyBmYWN0b3J5JywgdXNlci5hcmNoaXZlcyk7XG4gICAgICAgICAgdmFyIGFyY2hpdmVzID0ge3JlcG86IHVzZXIuYXJjaGl2ZXN9XG4gICAgICAgICAgcmV0dXJuICRodHRwLnB1dChkb21haW4gKyAnL2FwaS91c2Vycy8nICsgdXNlci5naXRodWIudXNlcm5hbWUgKyAnL2FyY2hpdmVSZXBvJywgYXJjaGl2ZXMpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBsaXN0RmlsZXM6IGZ1bmN0aW9uKHJlcG8pIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnbGlzdCBmaWxlIG5hbWVzIHVuZGVyIHRoZSByZXBvJywgcmVwbylcbiAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGRvbWFpbiArIFwiL2FwaS9yZXBvL2FsbFwiLCB7cGFyYW1zOiByZXBvfSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlcG9GaW5kT3JJbnNlcnQ6IGZ1bmN0aW9uKHJlcG8pIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnaXMgdGhlcmUgc3VjaCByZXBvPyBmYWN0b3J5JywgcmVwbylcbiAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGRvbWFpbiArIFwiL2FwaS9yZXBvL1wiLCB7cGFyYW1zOiByZXBvfSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9nb3V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnaGl0dGluZyB0aGUgZmFjdG9yeScpXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKycvbG9nb3V0JykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICBcdFx0XHQvL3RoaXMgbmVlZHMgYSBsb2dpYyByZW1hcFxuICAgICAgICAgICAgXHRjb25zb2xlLmxvZygnbG9nZ2VkIG91dCcpO1xuICAgICAgXHRcdH0pO1xuICAgICAgICB9XG5cbiAgICB9XG59KTtcblxuXG4vL2V4dGVuc2lvbiBvblxuLy90YWIgYmFyXG4vL1xuIiwiLy8gJ3VzZSBzdHJpY3QnO1xuLy8gYXBwLmRpcmVjdGl2ZSgnc2lkZWJhcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJHRpbWVvdXQsICRtZFNpZGVuYXYsICRsb2cpIHtcbi8vXG4vLyAgICAgcmV0dXJuIHtcbi8vICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbi8vICAgICAgICAgc2NvcGU6IHt9LFxuLy8gICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL3NpZGViYXIvc2lkZWJhci5odG1sJyxcbi8vICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG4vL1xuLy8gICAgICAgICAgIHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuLy8gICAgICAgICAgICRtZFNpZGVuYXYoJ3JpZ2h0JykuY2xvc2UoKVxuLy8gICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuLy8gICAgICAgICAgICAgICAkbG9nLmRlYnVnKFwiY2xvc2UgTEVGVCBpcyBkb25lXCIpO1xuLy8gICAgICAgICAgICAgfSk7XG4vLyAgICAgICAgICAgfTtcbi8vXG4vLyAgICAgICAgIH1cbi8vICAgICB9XG4vL1xuLy8gICB9XG4vLyB9KTtcbiIsIiIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhcmNoaXZlJywge1xuXHRcdHVybDogJy9hcmNoaXZlJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9hcmNoaXZlL2FyY2hpdmUuaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ0FyY2hpdmVDdHJsJyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRBdXRoZW50aWNhdGU6IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcblx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0XHRpZiAocmVzLmRhdGEpIHtcblx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn0pO1xuXG4vL2FkZCBGYWN0b3J5XG5hcHAuY29udHJvbGxlcignQXJjaGl2ZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJG1kRGlhbG9nKSB7XG5cbiAgcG9wdXBHaXRGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbih1c2VyKSB7XG5cdFx0JHNjb3BlLnVzZXIgPSB1c2VyLnVzZXI7XG4gICAgJHNjb3BlLnNob3dBcmNoID0gJHNjb3BlLnVzZXIuYXJjaGl2ZXM7XG5cdH0pXG5cblxuXG59KVxuIiwiJ3VzZSBzdHJpY3QnO1xuLy8gYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbi8vIFx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2ZpbGUnLCB7XG4vLyBcdFx0dXJsOiAnL2ZpbGUnLFxuLy8gXHRcdHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2ZpbGVzL2ZpbGUuaHRtbCcsXG4vLyBcdFx0Y29udHJvbGxlcjogJ0ZpbGVDdHJsJyxcbi8vIFx0XHRyZXNvbHZlOiB7XG4vLyBcdFx0XHRBdXRoZW50aWNhdGU6IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcbi8vIFx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcbi8vIFx0XHRcdFx0XHRpZiAocmVzLmRhdGEpIHtcbi8vIFx0XHRcdFx0XHRcdHJldHVyblxuLy8gXHRcdFx0XHRcdH1cbi8vIFx0XHRcdFx0XHRlbHNlIHtcbi8vIFx0XHRcdFx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKVxuLy8gXHRcdFx0XHRcdH1cbi8vIFx0XHRcdFx0fSk7XG4vLyBcdFx0XHR9XG4vLyBcdFx0fVxuLy8gXHR9KTtcbi8vIH0pO1xuXG4vL2FkZCBGYWN0b3J5XG5hcHAuY29udHJvbGxlcignRmlsZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJG1vZGFsSW5zdGFuY2UsIHJlcG8sICRtZERpYWxvZykge1xuXG4gIHBvcHVwR2l0RmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24odXNlcikge1xuXHRcdCRzY29wZS51c2VyID0gdXNlci51c2VyO1xuXHRcdCRzY29wZS5kaXNwbGF5TmFtZSA9ICRzY29wZS51c2VyLmdpdGh1Yi5uYW1lO1xuXG5cdH0pXG5cblx0JHNjb3BlLnJlcG9OYW1lID0gcmVwby5uYW1lO1xuXHRjb25zb2xlLmxvZygnZnJvbSB0aGUgY29udHJvbGxlciBpcyB0aGUgcmVwbycsIHJlcG8pXG5cblx0cG9wdXBHaXRGYWN0b3J5Lmxpc3RGaWxlcyhyZXBvKS50aGVuKGZ1bmN0aW9uKHJlcG8pe1xuICAgICAgICBjb25zb2xlLmxvZygnbGlzdCBmaWxlcycsIHJlcG8pXG4gICAgICAgIHJlcG8uZmlsZXMuZm9yRWFjaChmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgICAgICB2YXIgdXJsID0gZmlsZS5maWxlVXJsO1xuICAgICAgICAgICAgdmFyIGkgPSB1cmwubWF0Y2goL2Jsb2IvKS5pbmRleCArIDU7XG4gICAgICAgICAgICBmaWxlLmRpc3BsYXkgPSB1cmwuc2xpY2UoaSk7XG4gICAgICAgIH0pXG4gICAgICAgICRzY29wZS5maWxlc1VuZGVyUmVwbyA9IHJlcG8uZmlsZXM7XG4gICAgfSlcblxuXHQvLyAkc2NvcGUuc2hvd1lvdXJGaWxlcyA9ICRzY29wZS51c2VyLnJlcG9zO1xuXG5cdCRzY29wZS5nb1RvRmlsZSA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRjaHJvbWUudGFicy5jcmVhdGUoe1xuICAgICAgICB1cmw6IGZpbGUuZmlsZVVybFxuICAgIH0pO1xuXHR9XG5cblx0JHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gIH1cblxuXG59KVxuXG5cblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL255ank4NS9jb2RlX3Jldmlldy9jb21taXQvNGUwZjdlYzMzNTM5ODA0MzE2ZGZmZjc4NmI4MGJlODZkZTY3MmVhNFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL255ank4NS9jb2RlX3Jldmlldy9ibG9iL3JpZ2h0Q2xpY2svYnJvd3Nlci9zY3NzL2hvbWUvbWFpbi5zY3NzXG5cbi8vIEJyYW5jaDogcmlnaHRDbGlja1xuLy8gUmVwbyBOYW1lOiBjb2RlX3Jldmlld1xuLy8gRmlsZXM6IC9icm93c2VyL3Njc3MvaG9tZS9tYWluLnNjc3NcbiIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuXHRcdHVybDogJy9ob21lJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9ob21lL2hvbWUuaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ0hvbWVDdHJsJyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRBdXRoZW50aWNhdGU6IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcblx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0XHRpZiAocmVzLmRhdGEpIHtcblx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn0pO1xuXG4vL2FkZCBGYWN0b3J5XG5hcHAuY29udHJvbGxlcignSG9tZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJHRpbWVvdXQsICRtZFNpZGVuYXYsICRtZFV0aWwsICRsb2csICRtb2RhbCwgJG1kRGlhbG9nKSB7XG5cbiAgcG9wdXBHaXRGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbih1c2VyKSB7XG5cdFx0JHNjb3BlLnVzZXIgPSB1c2VyLnVzZXI7XG5cdFx0Y29uc29sZS5sb2coJ3VzZXInLCAkc2NvcGUudXNlcilcblx0XHQkc2NvcGUudG9rZW5PYmogPSB7dG9rZW46ICRzY29wZS51c2VyLmdpdGh1Yi50b2tlbn07XG5cdFx0Y29uc29sZS5sb2coJ2N1cnJlbnQgdXNlcicsICRzY29wZS51c2VyKVxuXHRcdCRzY29wZS5zaG93UmVwb3MgPSAkc2NvcGUudXNlci5yZXBvcztcblx0XHQkc2NvcGUubG9hZFJlcG9zKCk7XG5cdH0pXG5cblx0JHNjb3BlLmxvYWRSZXBvcyA9IGZ1bmN0aW9uICgpIHtcblx0XHRwb3B1cEdpdEZhY3RvcnkuZ2V0UmVwb3NUb0FkZCgkc2NvcGUudG9rZW5PYmopXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVwb3MpIHtcblx0XHRcdFx0JHNjb3BlLnJlcG9zVG9BZGQgPSByZXBvcztcblx0XHR9KS5jYXRjaCgkbG9nLmxvZy5iaW5kKCRsb2cpKTtcblx0fVxuXG5cblx0JHNjb3BlLnRvZ2dsZUFkZEJhciA9IGZ1bmN0aW9uICgpIHtcblx0XHQkc2NvcGUuc2hvd0FkZEJhciA9ICEkc2NvcGUuc2hvd0FkZEJhcjtcblx0fVxuXG5cblx0dmFyIGNhbm5vdEFkZEJveCA9IGZ1bmN0aW9uICgpIHtcblx0XHQkbWREaWFsb2cuc2hvdyhcblx0XHQkbWREaWFsb2cuYWxlcnQoKVxuXHRcdFx0LnBhcmVudChhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkpXG5cdFx0XHQudGl0bGUoJ1VuZm9ydHVuYXRlbHknKVxuXHRcdFx0LmNvbnRlbnQoJ1lvdSBjYW5ub3QgYWRkIGEgcmVwbyB5b3UgYWxyZWFkeSBhZGRlZC4nKVxuXHRcdFx0Lm9rKCdHb3QgaXQhJylcblx0XHQpO1xuXHR9XG5cblx0JHNjb3BlLmFkZFJlcG8gPSBmdW5jdGlvbiAocmVwbykge1xuXHRcdGNvbnNvbGUubG9nKCdhZGRpbmcgcmVwbycsIHJlcG8pXG5cblx0XHQvLyAvLyBjaGVja2luZyBpZiByZXBvIGV4aXN0XG5cdFx0Ly8gdmFyIGNoZWNrO1xuXHRcdC8vICRzY29wZS5zaG93UmVwb3MuZm9yRWFjaChmdW5jdGlvbihjdXJyZW50KSB7XG5cdFx0Ly8gXHRpZiAoY3VycmVudC5uYW1lID09PSByZXBvLm5hbWUpIHtcblx0XHQvLyBcdFx0Y2hlY2sgPSB0cnVlO1xuXHRcdC8vIFx0XHRjYW5ub3RBZGRCb3goKTtcblx0XHQvLyBcdH1cblx0XHQvLyB9KTtcblxuXHRcdC8vIGFkZCByZXBvIGlmIHJlcG8gZG9lc24ndCBleGlzdCBpbiB1c2VyLmRiXG5cdFx0Ly8gaWYgKCFjaGVjaykge1xuXG5cdFx0XHRwb3B1cEdpdEZhY3RvcnkuZ2V0Q29udHJpYnV0b3JzKHJlcG8uY29udHJpYnV0b3JzX3VybClcblx0XHRcdC50aGVuKGZ1bmN0aW9uKG5hbWVzKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCduYW1lcycsIG5hbWVzKVxuXHRcdFx0XHRyZXBvLmNvbnRyaWJ1dG9ycyA9IG5hbWVzO1xuXG5cdFx0XHRcdHZhciBzYXZlcmVwbyA9IHtuYW1lOiByZXBvLm5hbWUsIHVybDogcmVwby5odG1sX3VybCwgY29udHJpYnV0b3JzOiByZXBvLmNvbnRyaWJ1dG9yc31cblx0XHRcdFx0Y29uc29sZS5sb2coc2F2ZXJlcG8pXG5cblx0XHRcdFx0Ly9jcmVhdGUgUmVwbyBpZiBpdCBkb2Vzbid0IGV4aXN0IGluIHRoZSBSZXBvLmRiXG5cdFx0XHRcdHBvcHVwR2l0RmFjdG9yeS5yZXBvRmluZE9ySW5zZXJ0KHNhdmVyZXBvKS50aGVuKGZ1bmN0aW9uKHJlc0RhdGEpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZygnY2hlY2sgaWYgdGhlcmUgaXMgc3VjaCByZXBvJywgcmVzRGF0YSlcblxuXG5cdFx0XHRcdH0pXG5cblx0XHRcdFx0Ly8gLy9hZGRpbmcgcmVwb19pZCB0byB1c2VyLnJlcG8gYXJyYXkgaW4gdGhlIFVzZXIuZGJcblx0XHRcdFx0Ly8gJHNjb3BlLnVzZXIucmVwb3MucHVzaChyZXBvLl9pZCk7XG5cblx0XHRcdH0pXG5cdFx0Ly8gfTtcblxuXHR9XG5cblx0JHNjb3BlLmRlbGV0ZVJlcG8gPSBmdW5jdGlvbihyZXBvKSB7XG5cdFx0Y29uc29sZS5sb2coJ2RlbGV0aW5nIHJlcG8nKVxuXG5cdFx0dmFyIGNvbmZpcm0gPSAkbWREaWFsb2cuY29uZmlybSgpXG4gICAgICAucGFyZW50KGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KSlcbiAgICAgIC50aXRsZSgnQ29uZmlybScpXG4gICAgICAuY29udGVudCgnV291bGQgeW91IGxpa2UgdG8gZGVsZXRlIHRoaXMgcmVwbz8nKVxuICAgICAgLm9rKCdZZXMhJylcbiAgICAgIC5jYW5jZWwoJ05vIScpO1xuXG5cdFx0JG1kRGlhbG9nLnNob3coY29uZmlybSkudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdC8vYWZ0ZXIgY29uZmlybSBkZWxldGVcblx0XHRcdCRzY29wZS51c2VyLnJlcG9zLmZvckVhY2goZnVuY3Rpb24odXNlcnJlcG8sIGkpIHtcblx0XHRcdFx0aWYgKHVzZXJyZXBvLl9pZCA9PT0gcmVwby5faWQpICRzY29wZS51c2VyLnJlcG9zLnNwbGljZShpLDEpO1xuXHRcdFx0fSlcblx0XHRcdHBvcHVwR2l0RmFjdG9yeS5lZGl0UmVwbygkc2NvcGUudXNlcikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ2RlbGV0ZWQgcmVwbycsIHJlcylcblx0XHRcdH0pXG5cbiAgICB9KTtcblxuXHR9XG5cblx0JHNjb3BlLmdvQXJjaGl2ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdCRzdGF0ZS5nbygnYXJjaGl2ZScpO1xuXHR9XG5cblx0JHNjb3BlLmFyY2hpdmVSZXBvID0gZnVuY3Rpb24ocmVwbykge1xuXHRcdHZhciBjb25maXJtID0gJG1kRGlhbG9nLmNvbmZpcm0oKVxuICAgICAgLnBhcmVudChhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkpXG4gICAgICAudGl0bGUoJ0NvbmZpcm0nKVxuICAgICAgLmNvbnRlbnQoJ1dvdWxkIHlvdSBsaWtlIHRvIGFyY2hpdmUgdGhpcyByZXBvPycpXG4gICAgICAub2soJ1llcyEnKVxuICAgICAgLmNhbmNlbCgnTm8hJyk7XG5cblx0XHQkbWREaWFsb2cuc2hvdyhjb25maXJtKS50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly9hZnRlciBjb25maXJtIHRvIGFyY2hpdmVcblx0XHRcdC8vYWRkIHJlcG8gdG8gdXNlci5hcmNoaXZlc1xuXHRcdFx0JHNjb3BlLnVzZXIuYXJjaGl2ZXMucHVzaChyZXBvKTtcblx0XHRcdGNvbnNvbGUubG9nKCRzY29wZS51c2VyLmFyY2hpdmVzKTtcblx0XHRcdHBvcHVwR2l0RmFjdG9yeS5hcmNoaXZlUmVwbygkc2NvcGUudXNlcikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ2FyY2hpdmVkIHRvIGRiJywgcmVzKVxuXHRcdFx0fSlcblxuXHRcdFx0Ly9kZWxldGUgcmVwbyBmcm9tIHVzZXIucmVwb3Ncblx0XHRcdCRzY29wZS51c2VyLnJlcG9zLmZvckVhY2goZnVuY3Rpb24odXNlcnJlcG8sIGkpIHtcblx0XHRcdFx0aWYgKHVzZXJyZXBvLl9pZCA9PT0gcmVwby5faWQpICRzY29wZS51c2VyLnJlcG9zLnNwbGljZShpLDEpO1xuXHRcdFx0fSlcblx0XHRcdHBvcHVwR2l0RmFjdG9yeS5lZGl0UmVwbygkc2NvcGUudXNlcikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ2RlbGV0ZWQgcmVwbycsIHJlcylcblx0XHRcdH0pXG5cbiAgICB9KTtcblxuICAvLyB9O1xuXHRcdC8vICRzY29wZS51c2VyLnJlcG9zLmZvckVhY2goZnVuY3Rpb24odXNlcnJlcG8sIGkpe30pXG5cdH1cblxuXHQkc2NvcGUuZ29Ub1JlcG8gPSBmdW5jdGlvbihyZXBvKSB7XG5cdFx0Y2hyb21lLnRhYnMuY3JlYXRlKHtcbiAgICAgICAgdXJsOiByZXBvLnVybFxuICAgIH0pO1xuXHR9XG5cblx0Ly9saXN0IGZpbGVzIHVuZGVyIGEgcmVwb1xuXHQkc2NvcGUubGlzdEZpbGVzID0gZnVuY3Rpb24ocmVwbykge1xuXHRcdHZhciBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvZmlsZXMvZmlsZS5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdGaWxlQ3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHJlcG86IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiByZXBvO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cdH1cblxuXHQvL2xvZyBvdXRcblx0JHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcblx0XHRwb3B1cEdpdEZhY3RvcnkubG9nb3V0KCkudGhlbihmdW5jdGlvbigpe1xuXHRcdFx0JHN0YXRlLmdvKCdsb2dpbicpO1xuXHRcdH0pXG5cdH1cblxuXHQvL3NpZGViYXJcblx0JHNjb3BlLnRvZ2dsZUxlZnQgPSBidWlsZFRvZ2dsZXIoJ2xlZnQnKTtcblxuXHRmdW5jdGlvbiBidWlsZFRvZ2dsZXIobmF2SUQpIHtcbiAgICAgIHZhciBkZWJvdW5jZUZuID0gICRtZFV0aWwuZGVib3VuY2UoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICRtZFNpZGVuYXYobmF2SUQpXG4gICAgICAgICAgICAgIC50b2dnbGUoKVxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZyhcInRvZ2dsZSBcIiArIG5hdklEICsgXCIgaXMgZG9uZVwiKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSwzMDApO1xuICAgICAgcmV0dXJuIGRlYm91bmNlRm47XG4gIH1cblxuXHQkc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkbWRTaWRlbmF2KCdsZWZ0JykuY2xvc2UoKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJGxvZy5kZWJ1ZyhcImNsb3NlIExFRlQgaXMgZG9uZVwiKTtcbiAgICAgICAgfSk7XG4gIH07XG5cbn0pXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XG5cdFx0dXJsOiAnLycsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvbG9naW4vbG9naW4uaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ0xvZ2luQ29udHJvbGxlcicsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0TG9naW46IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcblx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0XHRpZihyZXMuZGF0YSkge1xuXHRcdFx0XHRcdFx0JHN0YXRlLmdvKCdob21lJylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCBwb3B1cEdpdEZhY3Rvcnkpe1xuICAkc2NvcGUubWVzc2FnZSA9IFwiQ2hlY2sgdGhpcyBwYWdlIG91dCBub3chXCI7XG5cblx0Ly8gJHNjb3BlLmxvZ2dlZGluID0gZmFsc2U7XG5cblx0JHNjb3BlLmdpdExvZ2luID0gZnVuY3Rpb24oKSB7XG5cdFx0Ly9uZWVkIHRvIGNoYW5nZSBsb2NhbGhvc3Q6MTMzNyB0byB0aGUgYXBwcm9wcmlhdGUgZG9tYWluIG5hbWUgYWZ0ZXIgZGVwbG95bWVudCEhIVxuXHRcdGNvbnNvbGUubG9nKCdnaXRMb2dpbicpXG5cdFx0JHNjb3BlLlN1Y2Nlc3NmdWxMb2dpbigpO1xuXHRcdGNocm9tZS50YWJzLmNyZWF0ZSh7XG4gICAgICAgIHVybDogXCJodHRwOi8vbG9jYWxob3N0OjEzMzcvYXV0aC9naXRodWJcIlxuICAgIH0pO1xuXG5cdH1cblxuXG5cdC8vIGNvbnNvbGUubG9nKHNlc3Npb24pXG5cblxuXHQkc2NvcGUuU3VjY2Vzc2Z1bExvZ2luID0gZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coJ3N1Y2Nlc3N1ZmxseSBsb2dnaW4nKVxuXG5cdFx0JHN0YXRlLmdvKCdob21lJylcblx0XHRnZXROYW1lKCk7XG5cdFx0Ly8gJHNjb3BlLmxvZ2dlZGluID0gdHJ1ZTtcblx0fVxuXG5cdHZhciBnZXROYW1lID0gZnVuY3Rpb24oKSB7XG5cdFx0cG9wdXBHaXRGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnZ2V0TmFtZScsIGRhdGEpO1xuXHRcdFx0Ly8gJHNjb3BlLm5hbWUgPVxuXHRcdH0pXG5cdH1cbn0pXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=