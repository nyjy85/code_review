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

        //adding or deleting repo from profile
        editRepo: function(user) {
          console.log('addRepoToProfile factory',user.repos)
          var repo = {repo: user.repos}
          return $http.put(domain + "/api/users/" + user.github.username + "/editRepo", repo)
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

	popupGitFactory.listFiles(repo).then(function(files){
		console.log('list files', files)
		files.forEach(function(file) {
			var url = file.fileUrl;
			var i = url.match(/blob/).index + 5;
			file.display = url.slice(i);
		})
		$scope.filesUnderRepo = files;
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
		console.log('current user', $scope.user)
		$scope.showRepos = $scope.user.repos;
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
		console.log('adding repo')

		// checking if repo exist
		var check;
		$scope.showRepos.forEach(function(current) {
			if (current.name === repo.name) {
				check = true;
				cannotAddBox();
			}
		});

		// add if repo doesn't exist
		if (!check) {
			var saveRepo = {url: repo.html_url, name: repo.name}
			$scope.user.repos.push(saveRepo);
			popupGitFactory.editRepo($scope.user).then(function(res) {
				console.log('added repo', res)
			})
		};

	}

	$scope.deleteRepo = function(repo) {
		console.log('deleting repo')

		$scope.user.repos.forEach(function(userrepo, i) {
			if (userrepo._id === repo._id) $scope.user.repos.splice(i,1);
		})
		popupGitFactory.editRepo($scope.user).then(function(res) {
			console.log('deleted repo', res)
		})
	}


	// $scope.goToRepo = function(repo) {
	// 	chrome.tabs.create({
  //       url: repo.url
  //   });
	// }

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

  //dropdown box for the individual repos, the " ... "
  var vm = this;
  vm.notificationsEnabled = true;
  vm.toggleNotifications = function() {
    vm.notificationsEnabled = !vm.notificationsEnabled;
  };

  vm.redial = function(e) {
    $mdDialog.show(
      $mdDialog.alert()
        .title('Suddenly, a redial')
        .content('You just called someone back. They told you the most amazing story that has ever been told. Have a cookie.')
        .ok('That was easy')
    );
  };

  vm.checkVoicemail = function() {
    // This never happens.
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZhY3Rvcmllcy9wb3B1cEdpdEZhY3RvcnkuanMiLCJkaXJlY3RpdmVzL3NldHRpbmdCdXR0b24vc2V0dGluZ0J1dHRvbi5qcyIsImRpcmVjdGl2ZXMvc2lkZWJhci9zaWRlYmFyLmpzIiwic3RhdGVzL2ZpbGVzL2ZpbGUuanMiLCJzdGF0ZXMvaG9tZS9ob21lLmpzIiwic3RhdGVzL2xvZ2luL2xvZ2luLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BEQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ0NvZGVSZXZpZXdFeHQnLCBbJ3VpLnJvdXRlcicsICd1aS5ib290c3RyYXAnLCAnbmdNYXRlcmlhbCddKTtcblxuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkbWRJY29uUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsICRjb21waWxlUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHtcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZUJhc2U6IGZhbHNlXG4gICAgfSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG4gICAgJG1kSWNvblByb3ZpZGVyXG4gICAgLmljb25TZXQoXCJjYWxsXCIsICdpbWcvaWNvbnMvY29tbXVuaWNhdGlvbi1pY29ucy5zdmcnLCAyNClcbiAgICAuaWNvblNldChcInNvY2lhbFwiLCAnaW1nL2ljb25zL3NvY2lhbC1pY29ucy5zdmcnLCAyNCk7XG5cblxuICAgIC8vIHdoaXRlbGlzdCB0aGUgY2hyb21lLWV4dGVuc2lvbjogcHJvdG9jb2xcbiAgICAvLyBzbyB0aGF0IGl0IGRvZXMgbm90IGFkZCBcInVuc2FmZTpcIlxuICAgICRjb21waWxlUHJvdmlkZXIuYUhyZWZTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8bWFpbHRvfGNocm9tZS1leHRlbnNpb24pOi8pO1xuICAgICRjb21waWxlUHJvdmlkZXIuaW1nU3JjU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfGZpbGV8bG9jYWx8Y2hyb21lLWV4dGVuc2lvbik6fGRhdGE6aW1hZ2VcXC8vKTtcblxufSk7XG5cblxuIiwiYXBwLmZhY3RvcnkoJ3BvcHVwR2l0RmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgdmFyIGRvbWFpbiA9IFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3XCI7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIGdldFVzZXJJbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGRvbWFpbiArIFwiL3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhOyAvL3Jlcy5kYXRhLnVzZXJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRSZXBvc1RvQWRkOiBmdW5jdGlvbih0b2tlbikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdoaXQgZ2V0cmVwbycsIHRva2VuKVxuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgXCIvYXBpL2dpdFwiLCB7cGFyYW1zOiB0b2tlbn0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICAvL2FkZGluZyBvciBkZWxldGluZyByZXBvIGZyb20gcHJvZmlsZVxuICAgICAgICBlZGl0UmVwbzogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdhZGRSZXBvVG9Qcm9maWxlIGZhY3RvcnknLHVzZXIucmVwb3MpXG4gICAgICAgICAgdmFyIHJlcG8gPSB7cmVwbzogdXNlci5yZXBvc31cbiAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KGRvbWFpbiArIFwiL2FwaS91c2Vycy9cIiArIHVzZXIuZ2l0aHViLnVzZXJuYW1lICsgXCIvZWRpdFJlcG9cIiwgcmVwbylcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGxpc3RGaWxlczogZnVuY3Rpb24ocmVwbykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdsaXN0IGZpbGUgbmFtZXMgdW5kZXIgdGhlIHJlcG8nLCByZXBvKVxuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgXCIvYXBpL2ZpbGUvcmVwby9cIiArIHJlcG8ubmFtZSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGxvZ291dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2hpdHRpbmcgdGhlIGZhY3RvcnknKVxuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgXHRcdFx0Ly90aGlzIG5lZWRzIGEgbG9naWMgcmVtYXBcbiAgICAgICAgICAgIFx0Y29uc29sZS5sb2coJ2xvZ2dlZCBvdXQnKTtcbiAgICAgIFx0XHR9KTtcbiAgICAgICAgfVxuXG4gICAgfVxufSk7XG5cblxuLy9leHRlbnNpb24gb25cbi8vdGFiIGJhclxuLy9cbiIsIiIsIi8vICd1c2Ugc3RyaWN0Jztcbi8vIGFwcC5kaXJlY3RpdmUoJ3NpZGViYXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHN0YXRlLCBwb3B1cEdpdEZhY3RvcnksICR0aW1lb3V0LCAkbWRTaWRlbmF2LCAkbG9nKSB7XG4vL1xuLy8gICAgIHJldHVybiB7XG4vLyAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4vLyAgICAgICAgIHNjb3BlOiB7fSxcbi8vICAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9zaWRlYmFyL3NpZGViYXIuaHRtbCcsXG4vLyAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuLy9cbi8vICAgICAgICAgICBzY29wZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbi8vICAgICAgICAgICAkbWRTaWRlbmF2KCdyaWdodCcpLmNsb3NlKClcbi8vICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbi8vICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZyhcImNsb3NlIExFRlQgaXMgZG9uZVwiKTtcbi8vICAgICAgICAgICAgIH0pO1xuLy8gICAgICAgICAgIH07XG4vL1xuLy8gICAgICAgICB9XG4vLyAgICAgfVxuLy9cbi8vICAgfVxuLy8gfSk7XG4iLCIndXNlIHN0cmljdCc7XG4vLyBhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuLy8gXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnZmlsZScsIHtcbi8vIFx0XHR1cmw6ICcvZmlsZScsXG4vLyBcdFx0dGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvZmlsZXMvZmlsZS5odG1sJyxcbi8vIFx0XHRjb250cm9sbGVyOiAnRmlsZUN0cmwnLFxuLy8gXHRcdHJlc29sdmU6IHtcbi8vIFx0XHRcdEF1dGhlbnRpY2F0ZTogZnVuY3Rpb24oJGh0dHAsICRzdGF0ZSkge1xuLy8gXHRcdFx0XHQkaHR0cC5nZXQoXCJodHRwOi8vbG9jYWxob3N0OjEzMzcvc2Vzc2lvblwiKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuLy8gXHRcdFx0XHRcdGlmIChyZXMuZGF0YSkge1xuLy8gXHRcdFx0XHRcdFx0cmV0dXJuXG4vLyBcdFx0XHRcdFx0fVxuLy8gXHRcdFx0XHRcdGVsc2Uge1xuLy8gXHRcdFx0XHRcdFx0JHN0YXRlLmdvKCdsb2dpbicpXG4vLyBcdFx0XHRcdFx0fVxuLy8gXHRcdFx0XHR9KTtcbi8vIFx0XHRcdH1cbi8vIFx0XHR9XG4vLyBcdH0pO1xuLy8gfSk7XG5cbi8vYWRkIEZhY3RvcnlcbmFwcC5jb250cm9sbGVyKCdGaWxlQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgcG9wdXBHaXRGYWN0b3J5LCAkbW9kYWxJbnN0YW5jZSwgcmVwbywgJG1kRGlhbG9nKSB7XG5cbiAgcG9wdXBHaXRGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbih1c2VyKSB7XG5cdFx0JHNjb3BlLnVzZXIgPSB1c2VyLnVzZXI7XG5cdFx0JHNjb3BlLmRpc3BsYXlOYW1lID0gJHNjb3BlLnVzZXIuZ2l0aHViLm5hbWU7XG5cblx0fSlcblxuXHQkc2NvcGUucmVwb05hbWUgPSByZXBvLm5hbWU7XG5cblx0cG9wdXBHaXRGYWN0b3J5Lmxpc3RGaWxlcyhyZXBvKS50aGVuKGZ1bmN0aW9uKGZpbGVzKXtcblx0XHRjb25zb2xlLmxvZygnbGlzdCBmaWxlcycsIGZpbGVzKVxuXHRcdGZpbGVzLmZvckVhY2goZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0dmFyIHVybCA9IGZpbGUuZmlsZVVybDtcblx0XHRcdHZhciBpID0gdXJsLm1hdGNoKC9ibG9iLykuaW5kZXggKyA1O1xuXHRcdFx0ZmlsZS5kaXNwbGF5ID0gdXJsLnNsaWNlKGkpO1xuXHRcdH0pXG5cdFx0JHNjb3BlLmZpbGVzVW5kZXJSZXBvID0gZmlsZXM7XG5cdH0pXG5cblx0Ly8gJHNjb3BlLnNob3dZb3VyRmlsZXMgPSAkc2NvcGUudXNlci5yZXBvcztcblxuXHQkc2NvcGUuZ29Ub0ZpbGUgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0Y2hyb21lLnRhYnMuY3JlYXRlKHtcbiAgICAgICAgdXJsOiBmaWxlLmZpbGVVcmxcbiAgICB9KTtcblx0fVxuXG5cdCRzY29wZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICB9XG5cblxufSlcblxuXG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ueWp5ODUvY29kZV9yZXZpZXcvY29tbWl0LzRlMGY3ZWMzMzUzOTgwNDMxNmRmZmY3ODZiODBiZTg2ZGU2NzJlYTRcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ueWp5ODUvY29kZV9yZXZpZXcvYmxvYi9yaWdodENsaWNrL2Jyb3dzZXIvc2Nzcy9ob21lL21haW4uc2Nzc1xuXG4vLyBCcmFuY2g6IHJpZ2h0Q2xpY2tcbi8vIFJlcG8gTmFtZTogY29kZV9yZXZpZXdcbi8vIEZpbGVzOiAvYnJvd3Nlci9zY3NzL2hvbWUvbWFpbi5zY3NzXG4iLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcblx0XHR1cmw6ICcvaG9tZScsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvaG9tZS9ob21lLmh0bWwnLFxuXHRcdGNvbnRyb2xsZXI6ICdIb21lQ3RybCcsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0QXV0aGVudGljYXRlOiBmdW5jdGlvbigkaHR0cCwgJHN0YXRlKSB7XG5cdFx0XHRcdCRodHRwLmdldChcImh0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9zZXNzaW9uXCIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdFx0aWYgKHJlcy5kYXRhKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHQkc3RhdGUuZ28oJ2xvZ2luJylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59KTtcblxuXG4vL2FkZCBGYWN0b3J5XG5hcHAuY29udHJvbGxlcignSG9tZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJHRpbWVvdXQsICRtZFNpZGVuYXYsICRtZFV0aWwsICRsb2csICRtb2RhbCwgJG1kRGlhbG9nKSB7XG5cbiAgcG9wdXBHaXRGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbih1c2VyKSB7XG5cdFx0JHNjb3BlLnVzZXIgPSB1c2VyLnVzZXI7XG5cdFx0Y29uc29sZS5sb2coJ2N1cnJlbnQgdXNlcicsICRzY29wZS51c2VyKVxuXHRcdCRzY29wZS5zaG93UmVwb3MgPSAkc2NvcGUudXNlci5yZXBvcztcblx0XHQkc2NvcGUubG9hZFJlcG9zKCk7XG5cdH0pXG5cblx0JHNjb3BlLmxvYWRSZXBvcyA9IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgdG9rZW5PYmogPSB7dG9rZW46ICRzY29wZS51c2VyLmdpdGh1Yi50b2tlbn07XG5cdFx0cG9wdXBHaXRGYWN0b3J5LmdldFJlcG9zVG9BZGQodG9rZW5PYmopLnRoZW4oZnVuY3Rpb24ocmVwb3MpIHtcblx0XHRcdFx0JHNjb3BlLnJlcG9zVG9BZGQgPSByZXBvcztcblx0XHR9KS5jYXRjaCgkbG9nLmxvZy5iaW5kKCRsb2cpKTtcblx0fVxuXG5cblx0JHNjb3BlLnRvZ2dsZUFkZEJhciA9IGZ1bmN0aW9uICgpIHtcblx0XHQkc2NvcGUuc2hvd0FkZEJhciA9ICEkc2NvcGUuc2hvd0FkZEJhcjtcblx0fVxuXG5cblx0dmFyIGNhbm5vdEFkZEJveCA9IGZ1bmN0aW9uICgpIHtcblx0XHQkbWREaWFsb2cuc2hvdyhcblx0XHQkbWREaWFsb2cuYWxlcnQoKVxuXHRcdFx0LnBhcmVudChhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkpXG5cdFx0XHQudGl0bGUoJ1VuZm9ydHVuYXRlbHknKVxuXHRcdFx0LmNvbnRlbnQoJ1lvdSBjYW5ub3QgYWRkIGEgcmVwbyB5b3UgYWxyZWFkeSBhZGRlZC4nKVxuXHRcdFx0Lm9rKCdHb3QgaXQhJylcblx0XHQpO1xuXHR9XG5cblx0JHNjb3BlLmFkZFJlcG8gPSBmdW5jdGlvbiAocmVwbykge1xuXHRcdGNvbnNvbGUubG9nKCdhZGRpbmcgcmVwbycpXG5cblx0XHQvLyBjaGVja2luZyBpZiByZXBvIGV4aXN0XG5cdFx0dmFyIGNoZWNrO1xuXHRcdCRzY29wZS5zaG93UmVwb3MuZm9yRWFjaChmdW5jdGlvbihjdXJyZW50KSB7XG5cdFx0XHRpZiAoY3VycmVudC5uYW1lID09PSByZXBvLm5hbWUpIHtcblx0XHRcdFx0Y2hlY2sgPSB0cnVlO1xuXHRcdFx0XHRjYW5ub3RBZGRCb3goKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIGFkZCBpZiByZXBvIGRvZXNuJ3QgZXhpc3Rcblx0XHRpZiAoIWNoZWNrKSB7XG5cdFx0XHR2YXIgc2F2ZVJlcG8gPSB7dXJsOiByZXBvLmh0bWxfdXJsLCBuYW1lOiByZXBvLm5hbWV9XG5cdFx0XHQkc2NvcGUudXNlci5yZXBvcy5wdXNoKHNhdmVSZXBvKTtcblx0XHRcdHBvcHVwR2l0RmFjdG9yeS5lZGl0UmVwbygkc2NvcGUudXNlcikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ2FkZGVkIHJlcG8nLCByZXMpXG5cdFx0XHR9KVxuXHRcdH07XG5cblx0fVxuXG5cdCRzY29wZS5kZWxldGVSZXBvID0gZnVuY3Rpb24ocmVwbykge1xuXHRcdGNvbnNvbGUubG9nKCdkZWxldGluZyByZXBvJylcblxuXHRcdCRzY29wZS51c2VyLnJlcG9zLmZvckVhY2goZnVuY3Rpb24odXNlcnJlcG8sIGkpIHtcblx0XHRcdGlmICh1c2VycmVwby5faWQgPT09IHJlcG8uX2lkKSAkc2NvcGUudXNlci5yZXBvcy5zcGxpY2UoaSwxKTtcblx0XHR9KVxuXHRcdHBvcHVwR2l0RmFjdG9yeS5lZGl0UmVwbygkc2NvcGUudXNlcikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdkZWxldGVkIHJlcG8nLCByZXMpXG5cdFx0fSlcblx0fVxuXG5cblx0Ly8gJHNjb3BlLmdvVG9SZXBvID0gZnVuY3Rpb24ocmVwbykge1xuXHQvLyBcdGNocm9tZS50YWJzLmNyZWF0ZSh7XG4gIC8vICAgICAgIHVybDogcmVwby51cmxcbiAgLy8gICB9KTtcblx0Ly8gfVxuXG5cdC8vbGlzdCBmaWxlcyB1bmRlciBhIHJlcG9cblx0JHNjb3BlLmxpc3RGaWxlcyA9IGZ1bmN0aW9uKHJlcG8pIHtcblx0XHR2YXIgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2ZpbGVzL2ZpbGUuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnRmlsZUN0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICByZXBvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gcmVwbztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXHR9XG5cblx0Ly9sb2cgb3V0XG5cdCRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0cG9wdXBHaXRGYWN0b3J5LmxvZ291dCgpLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKTtcblx0XHR9KVxuXHR9XG5cblx0Ly9zaWRlYmFyXG5cdCRzY29wZS50b2dnbGVMZWZ0ID0gYnVpbGRUb2dnbGVyKCdsZWZ0Jyk7XG5cblx0ZnVuY3Rpb24gYnVpbGRUb2dnbGVyKG5hdklEKSB7XG4gICAgICB2YXIgZGVib3VuY2VGbiA9ICAkbWRVdGlsLmRlYm91bmNlKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkbWRTaWRlbmF2KG5hdklEKVxuICAgICAgICAgICAgICAudG9nZ2xlKClcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICRsb2cuZGVidWcoXCJ0b2dnbGUgXCIgKyBuYXZJRCArIFwiIGlzIGRvbmVcIik7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sMzAwKTtcbiAgICAgIHJldHVybiBkZWJvdW5jZUZuO1xuICB9XG5cblx0JHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgJG1kU2lkZW5hdignbGVmdCcpLmNsb3NlKClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRsb2cuZGVidWcoXCJjbG9zZSBMRUZUIGlzIGRvbmVcIik7XG4gICAgICAgIH0pO1xuICB9O1xuXG4gIC8vZHJvcGRvd24gYm94IGZvciB0aGUgaW5kaXZpZHVhbCByZXBvcywgdGhlIFwiIC4uLiBcIlxuICB2YXIgdm0gPSB0aGlzO1xuICB2bS5ub3RpZmljYXRpb25zRW5hYmxlZCA9IHRydWU7XG4gIHZtLnRvZ2dsZU5vdGlmaWNhdGlvbnMgPSBmdW5jdGlvbigpIHtcbiAgICB2bS5ub3RpZmljYXRpb25zRW5hYmxlZCA9ICF2bS5ub3RpZmljYXRpb25zRW5hYmxlZDtcbiAgfTtcblxuICB2bS5yZWRpYWwgPSBmdW5jdGlvbihlKSB7XG4gICAgJG1kRGlhbG9nLnNob3coXG4gICAgICAkbWREaWFsb2cuYWxlcnQoKVxuICAgICAgICAudGl0bGUoJ1N1ZGRlbmx5LCBhIHJlZGlhbCcpXG4gICAgICAgIC5jb250ZW50KCdZb3UganVzdCBjYWxsZWQgc29tZW9uZSBiYWNrLiBUaGV5IHRvbGQgeW91IHRoZSBtb3N0IGFtYXppbmcgc3RvcnkgdGhhdCBoYXMgZXZlciBiZWVuIHRvbGQuIEhhdmUgYSBjb29raWUuJylcbiAgICAgICAgLm9rKCdUaGF0IHdhcyBlYXN5JylcbiAgICApO1xuICB9O1xuXG4gIHZtLmNoZWNrVm9pY2VtYWlsID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gVGhpcyBuZXZlciBoYXBwZW5zLlxuICB9O1xuXG5cblxufSlcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcblx0XHR1cmw6ICcvJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9sb2dpbi9sb2dpbi5odG1sJyxcblx0XHRjb250cm9sbGVyOiAnTG9naW5Db250cm9sbGVyJyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRMb2dpbjogZnVuY3Rpb24oJGh0dHAsICRzdGF0ZSkge1xuXHRcdFx0XHQkaHR0cC5nZXQoXCJodHRwOi8vbG9jYWxob3N0OjEzMzcvc2Vzc2lvblwiKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRcdGlmKHJlcy5kYXRhKSB7XG5cdFx0XHRcdFx0XHQkc3RhdGUuZ28oJ2hvbWUnKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignTG9naW5Db250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSl7XG4gICRzY29wZS5tZXNzYWdlID0gXCJDaGVjayB0aGlzIHBhZ2Ugb3V0IG5vdyFcIjtcblxuXHQvLyAkc2NvcGUubG9nZ2VkaW4gPSBmYWxzZTtcblxuXHQkc2NvcGUuZ2l0TG9naW4gPSBmdW5jdGlvbigpIHtcblx0XHQvL25lZWQgdG8gY2hhbmdlIGxvY2FsaG9zdDoxMzM3IHRvIHRoZSBhcHByb3ByaWF0ZSBkb21haW4gbmFtZSBhZnRlciBkZXBsb3ltZW50ISEhXG5cdFx0Y29uc29sZS5sb2coJ2dpdExvZ2luJylcblx0XHQkc2NvcGUuU3VjY2Vzc2Z1bExvZ2luKCk7XG5cdFx0Y2hyb21lLnRhYnMuY3JlYXRlKHtcbiAgICAgICAgdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9hdXRoL2dpdGh1YlwiXG4gICAgfSk7XG5cblx0fVxuXG5cblx0Ly8gY29uc29sZS5sb2coc2Vzc2lvbilcblxuXG5cdCRzY29wZS5TdWNjZXNzZnVsTG9naW4gPSBmdW5jdGlvbigpIHtcblx0XHRjb25zb2xlLmxvZygnc3VjY2Vzc3VmbGx5IGxvZ2dpbicpXG5cblx0XHQkc3RhdGUuZ28oJ2hvbWUnKVxuXHRcdGdldE5hbWUoKTtcblx0XHQvLyAkc2NvcGUubG9nZ2VkaW4gPSB0cnVlO1xuXHR9XG5cblx0dmFyIGdldE5hbWUgPSBmdW5jdGlvbigpIHtcblx0XHRwb3B1cEdpdEZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdnZXROYW1lJywgZGF0YSk7XG5cdFx0XHQvLyAkc2NvcGUubmFtZSA9XG5cdFx0fSlcblx0fVxufSlcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==