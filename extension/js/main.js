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
            return res.data.user;
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

          return $http.get(domain + "/api/git/repos/" + owner + '/' + repo + '/contributors')
          .then(function(res) {
            return res.data;
          })
        },

        //deleting repo from profile
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

        getNotification: function(user) {
          return $http.get(domain + '/api/users/' + user.github.username + '/notifications')
          .then(function(res) {
            return res.data;
          })
        },

        logout: function() {
          console.log('hitting the factory')
          return $http.get(domain +'/logout').then(function (res) {
      			 return "Logged Out";
    		});
      }
    }
});


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

app.controller('HomeCtrl', function ($scope, $state, popupGitFactory, $timeout, $mdSidenav, $mdUtil, $timeout, $q, $log, $modal, $mdDialog) {

  $scope.reposLoaded = popupGitFactory.getUserInfo().then(function(user) {
		$scope.user = user;
		$scope.tokenObj = {token: $scope.user.github.token};
		$scope.showRepos = $scope.user.repos;
		$scope.notiNum = $scope.user.notifications.length;
		return $scope.loadRepos();
	})

	$scope.loadRepos = function () {
		return popupGitFactory.getReposToAdd($scope.tokenObj)
		.then(function(repos) {
				$scope.reposToAdd = repos;
				return repos;
		})
	}

	$scope.querySearch = function (query) {

		return $scope.reposLoaded.then(function(){
			return query ? $scope.reposToAdd.filter(filterFn) : $scope.reposToAdd;
		});

		function filterFn(repo) {
			return (repo.name.toLowerCase().indexOf(angular.lowercase(query)) === 0);
		};
	}

	$scope.toggleAddBar = function () {
		$scope.showAddBar = !$scope.showAddBar;
	}

	$scope.toggleNotification = function () {
		$scope.notifications();
		$scope.showNotification = !$scope.showNotification;
	}

	$scope.notifications = function () {
		popupGitFactory.getNotification($scope.user)
		.then(function(notifications) {
			console.log('notificatiosn!!!!!',notifications)
			notifications.map(function(notification){

				var h = notification.highlight,
					  fileUrl = h.fileUrl,
					  timestamp = h.comment.timestamp,
						commenter = h.comment.commenter,
						message = h.comment.message;

				var message = {
					{update: 'newHighlight', display: 'Joe just added 1 new comment on repo(master/app.js) timestamp'},
					{update: 'newComment', display: 'Joe just responded on repo(master/app.js) timestamp'}
				}

				notification.repoName = fileUrl.split('/')[5];
				notification.file = fileUrl.slice(fileUrl.match(/blob/).index + 5);

				if (notification.update === message.update) {
					notification.display = message.display;
				}


			})
			$scope.notifications = notifications;
		})


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
			$scope.repoSelected = null;

			popupGitFactory.getContributors(repo.contributors_url)
			.then(function(names) {
				repo.contributors = names;

				var saverepo = {name: repo.name, url: repo.html_url, contributors: repo.contributors}

				//create Repo if it doesn't exist in the Repo.db + add repo to User.db
				popupGitFactory.repoFindOrInsert(saverepo).then(function(resData) {
					if(!resData.userAlreadyHad) {
						$scope.user.repos.push(resData.repo);
						chromeRefresh();
					}
					else cannotAddBox();

				})
			})

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
			console.log('users repo', $scope.user.repos)
			$scope.user.repos.forEach(function(userrepo, i) {
				console.log('userrepo in deleterepo!!!', userrepo, repo)
				if (userrepo._id === repo._id) $scope.user.repos.splice(i,1);
			})
			popupGitFactory.editRepo($scope.user).then(function(res) {
				chromeRefresh();
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
		popupGitFactory.logout().then(function(res){
			$state.go('login');
			// chrome.tabs.query({title: 'Highlight Your World'}, function(tabs){
   //        		tabs.forEach(function(tab){
   //          	chrome.tabs.sendMessage(tab.id, message: 'logout');
   //          	})
   //        	});
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

  	function chromeRefresh () {
  		chrome.tabs.query({title: 'Highlight Your World'}, function(tabs){
		tabs.forEach(function(tab){
			chrome.tabs.reload(tab.id);
			})
		})
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZhY3Rvcmllcy9wb3B1cEdpdEZhY3RvcnkuanMiLCJkaXJlY3RpdmVzL3NldHRpbmdCdXR0b24vc2V0dGluZ0J1dHRvbi5qcyIsImRpcmVjdGl2ZXMvc2lkZWJhci9zaWRlYmFyLmpzIiwic3RhdGVzL2FyY2hpdmUvYXJjaGl2ZS5qcyIsInN0YXRlcy9maWxlcy9maWxlLmpzIiwic3RhdGVzL2hvbWUvaG9tZS5qcyIsInN0YXRlcy9sb2dpbi9sb2dpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakZBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdDb2RlUmV2aWV3RXh0JywgWyd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nTWF0ZXJpYWwnXSk7XG5cblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJG1kSWNvblByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHJlcXVpcmVCYXNlOiBmYWxzZVxuICAgIH0pO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcblxuICAgICRtZEljb25Qcm92aWRlclxuICAgIC5pY29uU2V0KFwiY2FsbFwiLCAnaW1nL2ljb25zL2NvbW11bmljYXRpb24taWNvbnMuc3ZnJywgMjQpXG4gICAgLmljb25TZXQoXCJzb2NpYWxcIiwgJ2ltZy9pY29ucy9zb2NpYWwtaWNvbnMuc3ZnJywgMjQpO1xuXG5cbiAgICAvLyB3aGl0ZWxpc3QgdGhlIGNocm9tZS1leHRlbnNpb246IHByb3RvY29sXG4gICAgLy8gc28gdGhhdCBpdCBkb2VzIG5vdCBhZGQgXCJ1bnNhZmU6XCJcbiAgICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3xjaHJvbWUtZXh0ZW5zaW9uKTovKTtcbiAgICAkY29tcGlsZVByb3ZpZGVyLmltZ1NyY1Nhbml0aXphdGlvbldoaXRlbGlzdCgvXlxccyooaHR0cHM/fGZ0cHxmaWxlfGxvY2FsfGNocm9tZS1leHRlbnNpb24pOnxkYXRhOmltYWdlXFwvLyk7XG5cbn0pO1xuXG5cbiIsImFwcC5mYWN0b3J5KCdwb3B1cEdpdEZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCkge1xuICAgIHZhciBkb21haW4gPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MTMzN1wiO1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICBnZXRVc2VySW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9zZXNzaW9uXCIpLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YS51c2VyO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFJlcG9zVG9BZGQ6IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2hpdCBnZXRyZXBvJywgdG9rZW4pXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9hcGkvZ2l0XCIsIHtwYXJhbXM6IHRva2VufSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldENvbnRyaWJ1dG9yczogZnVuY3Rpb24oY29udHJpYnV0b3JVcmwpIHtcbiAgICAgICAgICB2YXIgaSA9IGNvbnRyaWJ1dG9yVXJsLm1hdGNoKC9yZXBvcy8pLmluZGV4ICsgNjtcbiAgICAgICAgICB2YXIgcmVwb1VybCA9IGNvbnRyaWJ1dG9yVXJsLnNsaWNlKGksIC0xMyk7XG4gICAgICAgICAgdmFyIG93bmVyID0gcmVwb1VybC5zcGxpdCgnLycpWzBdO1xuICAgICAgICAgIHZhciByZXBvID0gcmVwb1VybC5zcGxpdCgnLycpWzFdO1xuXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9hcGkvZ2l0L3JlcG9zL1wiICsgb3duZXIgKyAnLycgKyByZXBvICsgJy9jb250cmlidXRvcnMnKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgLy9kZWxldGluZyByZXBvIGZyb20gcHJvZmlsZVxuICAgICAgICBlZGl0UmVwbzogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdhZGRSZXBvVG9Qcm9maWxlIGZhY3RvcnknLHVzZXIucmVwb3MpXG4gICAgICAgICAgdmFyIHJlcG8gPSB7cmVwbzogdXNlci5yZXBvc31cbiAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KGRvbWFpbiArIFwiL2FwaS91c2Vycy9cIiArIHVzZXIuZ2l0aHViLnVzZXJuYW1lICsgXCIvZWRpdFJlcG9cIiwgcmVwbylcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGFyY2hpdmVSZXBvOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2FyY2hpZXZlIHJlcG8gZmFjdG9yeScsIHVzZXIuYXJjaGl2ZXMpO1xuICAgICAgICAgIHZhciBhcmNoaXZlcyA9IHtyZXBvOiB1c2VyLmFyY2hpdmVzfVxuICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoZG9tYWluICsgJy9hcGkvdXNlcnMvJyArIHVzZXIuZ2l0aHViLnVzZXJuYW1lICsgJy9hcmNoaXZlUmVwbycsIGFyY2hpdmVzKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgbGlzdEZpbGVzOiBmdW5jdGlvbihyZXBvKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2xpc3QgZmlsZSBuYW1lcyB1bmRlciB0aGUgcmVwbycsIHJlcG8pXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9hcGkvcmVwby9hbGxcIiwge3BhcmFtczogcmVwb30pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICByZXBvRmluZE9ySW5zZXJ0OiBmdW5jdGlvbihyZXBvKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2lzIHRoZXJlIHN1Y2ggcmVwbz8gZmFjdG9yeScsIHJlcG8pXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9hcGkvcmVwby9cIiwge3BhcmFtczogcmVwb30pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldE5vdGlmaWNhdGlvbjogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgJy9hcGkvdXNlcnMvJyArIHVzZXIuZ2l0aHViLnVzZXJuYW1lICsgJy9ub3RpZmljYXRpb25zJylcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGxvZ291dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2hpdHRpbmcgdGhlIGZhY3RvcnknKVxuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgXHRcdFx0IHJldHVybiBcIkxvZ2dlZCBPdXRcIjtcbiAgICBcdFx0fSk7XG4gICAgICB9XG4gICAgfVxufSk7XG4iLCIiLCIvLyAndXNlIHN0cmljdCc7XG4vLyBhcHAuZGlyZWN0aXZlKCdzaWRlYmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzdGF0ZSwgcG9wdXBHaXRGYWN0b3J5LCAkdGltZW91dCwgJG1kU2lkZW5hdiwgJGxvZykge1xuLy9cbi8vICAgICByZXR1cm4ge1xuLy8gICAgICAgICByZXN0cmljdDogJ0UnLFxuLy8gICAgICAgICBzY29wZToge30sXG4vLyAgICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvc2lkZWJhci9zaWRlYmFyLmh0bWwnLFxuLy8gICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcbi8vXG4vLyAgICAgICAgICAgc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAgICAgJG1kU2lkZW5hdigncmlnaHQnKS5jbG9zZSgpXG4vLyAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAgICAgICAgICRsb2cuZGVidWcoXCJjbG9zZSBMRUZUIGlzIGRvbmVcIik7XG4vLyAgICAgICAgICAgICB9KTtcbi8vICAgICAgICAgICB9O1xuLy9cbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vXG4vLyAgIH1cbi8vIH0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2FyY2hpdmUnLCB7XG5cdFx0dXJsOiAnL2FyY2hpdmUnLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2FyY2hpdmUvYXJjaGl2ZS5odG1sJyxcblx0XHRjb250cm9sbGVyOiAnQXJjaGl2ZUN0cmwnLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdEF1dGhlbnRpY2F0ZTogZnVuY3Rpb24oJGh0dHAsICRzdGF0ZSkge1xuXHRcdFx0XHQkaHR0cC5nZXQoXCJodHRwOi8vbG9jYWxob3N0OjEzMzcvc2Vzc2lvblwiKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRcdGlmIChyZXMuZGF0YSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0JHN0YXRlLmdvKCdsb2dpbicpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufSk7XG5cbi8vYWRkIEZhY3RvcnlcbmFwcC5jb250cm9sbGVyKCdBcmNoaXZlQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgcG9wdXBHaXRGYWN0b3J5LCAkbWREaWFsb2cpIHtcblxuICBwb3B1cEdpdEZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcblx0XHQkc2NvcGUudXNlciA9IHVzZXIudXNlcjtcbiAgICAkc2NvcGUuc2hvd0FyY2ggPSAkc2NvcGUudXNlci5hcmNoaXZlcztcblx0fSlcblxuXG5cbn0pXG4iLCIndXNlIHN0cmljdCc7XG4vLyBhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuLy8gXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnZmlsZScsIHtcbi8vIFx0XHR1cmw6ICcvZmlsZScsXG4vLyBcdFx0dGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvZmlsZXMvZmlsZS5odG1sJyxcbi8vIFx0XHRjb250cm9sbGVyOiAnRmlsZUN0cmwnLFxuLy8gXHRcdHJlc29sdmU6IHtcbi8vIFx0XHRcdEF1dGhlbnRpY2F0ZTogZnVuY3Rpb24oJGh0dHAsICRzdGF0ZSkge1xuLy8gXHRcdFx0XHQkaHR0cC5nZXQoXCJodHRwOi8vbG9jYWxob3N0OjEzMzcvc2Vzc2lvblwiKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuLy8gXHRcdFx0XHRcdGlmIChyZXMuZGF0YSkge1xuLy8gXHRcdFx0XHRcdFx0cmV0dXJuXG4vLyBcdFx0XHRcdFx0fVxuLy8gXHRcdFx0XHRcdGVsc2Uge1xuLy8gXHRcdFx0XHRcdFx0JHN0YXRlLmdvKCdsb2dpbicpXG4vLyBcdFx0XHRcdFx0fVxuLy8gXHRcdFx0XHR9KTtcbi8vIFx0XHRcdH1cbi8vIFx0XHR9XG4vLyBcdH0pO1xuLy8gfSk7XG5cbi8vYWRkIEZhY3RvcnlcbmFwcC5jb250cm9sbGVyKCdGaWxlQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgcG9wdXBHaXRGYWN0b3J5LCAkbW9kYWxJbnN0YW5jZSwgcmVwbywgJG1kRGlhbG9nKSB7XG5cbiAgcG9wdXBHaXRGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbih1c2VyKSB7XG5cdFx0JHNjb3BlLnVzZXIgPSB1c2VyLnVzZXI7XG5cdFx0JHNjb3BlLmRpc3BsYXlOYW1lID0gJHNjb3BlLnVzZXIuZ2l0aHViLm5hbWU7XG5cblx0fSlcblxuXHQkc2NvcGUucmVwb05hbWUgPSByZXBvLm5hbWU7XG5cdGNvbnNvbGUubG9nKCdmcm9tIHRoZSBjb250cm9sbGVyIGlzIHRoZSByZXBvJywgcmVwbylcblxuXHRwb3B1cEdpdEZhY3RvcnkubGlzdEZpbGVzKHJlcG8pLnRoZW4oZnVuY3Rpb24ocmVwbyl7XG5cblx0XHRjb25zb2xlLmxvZygnbGlzdCBmaWxlcycsIHJlcG8pXG5cblx0XHRyZXBvLmZpbGVzLmZvckVhY2goZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0dmFyIHVybCA9IGZpbGUuZmlsZVVybDtcblx0XHRcdHZhciBpID0gdXJsLm1hdGNoKC9ibG9iLykuaW5kZXggKyA1O1xuXHRcdFx0ZmlsZS5kaXNwbGF5ID0gdXJsLnNsaWNlKGkpO1xuXHRcdH0pXG5cdFx0JHNjb3BlLmZpbGVzVW5kZXJSZXBvID0gcmVwby5maWxlcztcblx0fSlcblxuXG5cdC8vICRzY29wZS5zaG93WW91ckZpbGVzID0gJHNjb3BlLnVzZXIucmVwb3M7XG5cblx0JHNjb3BlLmdvVG9GaWxlID0gZnVuY3Rpb24oZmlsZSkge1xuXHRcdGNocm9tZS50YWJzLmNyZWF0ZSh7XG4gICAgICAgIHVybDogZmlsZS5maWxlVXJsXG4gICAgfSk7XG5cdH1cblxuXHQkc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgfVxuXG5cbn0pXG5cblxuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbnlqeTg1L2NvZGVfcmV2aWV3L2NvbW1pdC80ZTBmN2VjMzM1Mzk4MDQzMTZkZmZmNzg2YjgwYmU4NmRlNjcyZWE0XG4vLyBodHRwczovL2dpdGh1Yi5jb20vbnlqeTg1L2NvZGVfcmV2aWV3L2Jsb2IvcmlnaHRDbGljay9icm93c2VyL3Njc3MvaG9tZS9tYWluLnNjc3NcblxuLy8gQnJhbmNoOiByaWdodENsaWNrXG4vLyBSZXBvIE5hbWU6IGNvZGVfcmV2aWV3XG4vLyBGaWxlczogL2Jyb3dzZXIvc2Nzcy9ob21lL21haW4uc2Nzc1xuIiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG5cdFx0dXJsOiAnL2hvbWUnLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2hvbWUvaG9tZS5odG1sJyxcblx0XHRjb250cm9sbGVyOiAnSG9tZUN0cmwnLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdEF1dGhlbnRpY2F0ZTogZnVuY3Rpb24oJGh0dHAsICRzdGF0ZSkge1xuXHRcdFx0XHQkaHR0cC5nZXQoXCJodHRwOi8vbG9jYWxob3N0OjEzMzcvc2Vzc2lvblwiKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRcdGlmIChyZXMuZGF0YSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0JHN0YXRlLmdvKCdsb2dpbicpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdIb21lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgcG9wdXBHaXRGYWN0b3J5LCAkdGltZW91dCwgJG1kU2lkZW5hdiwgJG1kVXRpbCwgJHRpbWVvdXQsICRxLCAkbG9nLCAkbW9kYWwsICRtZERpYWxvZykge1xuXG4gICRzY29wZS5yZXBvc0xvYWRlZCA9IHBvcHVwR2l0RmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24odXNlcikge1xuXHRcdCRzY29wZS51c2VyID0gdXNlcjtcblx0XHQkc2NvcGUudG9rZW5PYmogPSB7dG9rZW46ICRzY29wZS51c2VyLmdpdGh1Yi50b2tlbn07XG5cdFx0JHNjb3BlLnNob3dSZXBvcyA9ICRzY29wZS51c2VyLnJlcG9zO1xuXHRcdCRzY29wZS5ub3RpTnVtID0gJHNjb3BlLnVzZXIubm90aWZpY2F0aW9ucy5sZW5ndGg7XG5cdFx0cmV0dXJuICRzY29wZS5sb2FkUmVwb3MoKTtcblx0fSlcblxuXHQkc2NvcGUubG9hZFJlcG9zID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBwb3B1cEdpdEZhY3RvcnkuZ2V0UmVwb3NUb0FkZCgkc2NvcGUudG9rZW5PYmopXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVwb3MpIHtcblx0XHRcdFx0JHNjb3BlLnJlcG9zVG9BZGQgPSByZXBvcztcblx0XHRcdFx0cmV0dXJuIHJlcG9zO1xuXHRcdH0pXG5cdH1cblxuXHQkc2NvcGUucXVlcnlTZWFyY2ggPSBmdW5jdGlvbiAocXVlcnkpIHtcblxuXHRcdHJldHVybiAkc2NvcGUucmVwb3NMb2FkZWQudGhlbihmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHF1ZXJ5ID8gJHNjb3BlLnJlcG9zVG9BZGQuZmlsdGVyKGZpbHRlckZuKSA6ICRzY29wZS5yZXBvc1RvQWRkO1xuXHRcdH0pO1xuXG5cdFx0ZnVuY3Rpb24gZmlsdGVyRm4ocmVwbykge1xuXHRcdFx0cmV0dXJuIChyZXBvLm5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKGFuZ3VsYXIubG93ZXJjYXNlKHF1ZXJ5KSkgPT09IDApO1xuXHRcdH07XG5cdH1cblxuXHQkc2NvcGUudG9nZ2xlQWRkQmFyID0gZnVuY3Rpb24gKCkge1xuXHRcdCRzY29wZS5zaG93QWRkQmFyID0gISRzY29wZS5zaG93QWRkQmFyO1xuXHR9XG5cblx0JHNjb3BlLnRvZ2dsZU5vdGlmaWNhdGlvbiA9IGZ1bmN0aW9uICgpIHtcblx0XHQkc2NvcGUubm90aWZpY2F0aW9ucygpO1xuXHRcdCRzY29wZS5zaG93Tm90aWZpY2F0aW9uID0gISRzY29wZS5zaG93Tm90aWZpY2F0aW9uO1xuXHR9XG5cblx0JHNjb3BlLm5vdGlmaWNhdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0cG9wdXBHaXRGYWN0b3J5LmdldE5vdGlmaWNhdGlvbigkc2NvcGUudXNlcilcblx0XHQudGhlbihmdW5jdGlvbihub3RpZmljYXRpb25zKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnbm90aWZpY2F0aW9zbiEhISEhJyxub3RpZmljYXRpb25zKVxuXHRcdFx0bm90aWZpY2F0aW9ucy5tYXAoZnVuY3Rpb24obm90aWZpY2F0aW9uKXtcblxuXHRcdFx0XHR2YXIgaCA9IG5vdGlmaWNhdGlvbi5oaWdobGlnaHQsXG5cdFx0XHRcdFx0ICBmaWxlVXJsID0gaC5maWxlVXJsLFxuXHRcdFx0XHRcdCAgdGltZXN0YW1wID0gaC5jb21tZW50LnRpbWVzdGFtcCxcblx0XHRcdFx0XHRcdGNvbW1lbnRlciA9IGguY29tbWVudC5jb21tZW50ZXIsXG5cdFx0XHRcdFx0XHRtZXNzYWdlID0gaC5jb21tZW50Lm1lc3NhZ2U7XG5cblx0XHRcdFx0dmFyIG1lc3NhZ2UgPSB7XG5cdFx0XHRcdFx0e3VwZGF0ZTogJ25ld0hpZ2hsaWdodCcsIGRpc3BsYXk6ICdKb2UganVzdCBhZGRlZCAxIG5ldyBjb21tZW50IG9uIHJlcG8obWFzdGVyL2FwcC5qcykgdGltZXN0YW1wJ30sXG5cdFx0XHRcdFx0e3VwZGF0ZTogJ25ld0NvbW1lbnQnLCBkaXNwbGF5OiAnSm9lIGp1c3QgcmVzcG9uZGVkIG9uIHJlcG8obWFzdGVyL2FwcC5qcykgdGltZXN0YW1wJ31cblx0XHRcdFx0fVxuXG5cdFx0XHRcdG5vdGlmaWNhdGlvbi5yZXBvTmFtZSA9IGZpbGVVcmwuc3BsaXQoJy8nKVs1XTtcblx0XHRcdFx0bm90aWZpY2F0aW9uLmZpbGUgPSBmaWxlVXJsLnNsaWNlKGZpbGVVcmwubWF0Y2goL2Jsb2IvKS5pbmRleCArIDUpO1xuXG5cdFx0XHRcdGlmIChub3RpZmljYXRpb24udXBkYXRlID09PSBtZXNzYWdlLnVwZGF0ZSkge1xuXHRcdFx0XHRcdG5vdGlmaWNhdGlvbi5kaXNwbGF5ID0gbWVzc2FnZS5kaXNwbGF5O1xuXHRcdFx0XHR9XG5cblxuXHRcdFx0fSlcblx0XHRcdCRzY29wZS5ub3RpZmljYXRpb25zID0gbm90aWZpY2F0aW9ucztcblx0XHR9KVxuXG5cblx0fVxuXG5cdHZhciBjYW5ub3RBZGRCb3ggPSBmdW5jdGlvbiAoKSB7XG5cdFx0JG1kRGlhbG9nLnNob3coXG5cdFx0JG1kRGlhbG9nLmFsZXJ0KClcblx0XHRcdC5wYXJlbnQoYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpKVxuXHRcdFx0LnRpdGxlKCdVbmZvcnR1bmF0ZWx5Jylcblx0XHRcdC5jb250ZW50KCdZb3UgY2Fubm90IGFkZCBhIHJlcG8geW91IGFscmVhZHkgYWRkZWQuJylcblx0XHRcdC5vaygnR290IGl0IScpXG5cdFx0KTtcblx0fVxuXG5cdCRzY29wZS5hZGRSZXBvID0gZnVuY3Rpb24gKHJlcG8pIHtcblx0XHRcdCRzY29wZS5yZXBvU2VsZWN0ZWQgPSBudWxsO1xuXG5cdFx0XHRwb3B1cEdpdEZhY3RvcnkuZ2V0Q29udHJpYnV0b3JzKHJlcG8uY29udHJpYnV0b3JzX3VybClcblx0XHRcdC50aGVuKGZ1bmN0aW9uKG5hbWVzKSB7XG5cdFx0XHRcdHJlcG8uY29udHJpYnV0b3JzID0gbmFtZXM7XG5cblx0XHRcdFx0dmFyIHNhdmVyZXBvID0ge25hbWU6IHJlcG8ubmFtZSwgdXJsOiByZXBvLmh0bWxfdXJsLCBjb250cmlidXRvcnM6IHJlcG8uY29udHJpYnV0b3JzfVxuXG5cdFx0XHRcdC8vY3JlYXRlIFJlcG8gaWYgaXQgZG9lc24ndCBleGlzdCBpbiB0aGUgUmVwby5kYiArIGFkZCByZXBvIHRvIFVzZXIuZGJcblx0XHRcdFx0cG9wdXBHaXRGYWN0b3J5LnJlcG9GaW5kT3JJbnNlcnQoc2F2ZXJlcG8pLnRoZW4oZnVuY3Rpb24ocmVzRGF0YSkge1xuXHRcdFx0XHRcdGlmKCFyZXNEYXRhLnVzZXJBbHJlYWR5SGFkKSB7XG5cdFx0XHRcdFx0XHQkc2NvcGUudXNlci5yZXBvcy5wdXNoKHJlc0RhdGEucmVwbyk7XG5cdFx0XHRcdFx0XHRjaHJvbWVSZWZyZXNoKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgY2Fubm90QWRkQm94KCk7XG5cblx0XHRcdFx0fSlcblx0XHRcdH0pXG5cblx0fVxuXG5cdCRzY29wZS5kZWxldGVSZXBvID0gZnVuY3Rpb24ocmVwbykge1xuXHRcdGNvbnNvbGUubG9nKCdkZWxldGluZyByZXBvJylcblxuXHRcdHZhciBjb25maXJtID0gJG1kRGlhbG9nLmNvbmZpcm0oKVxuICAgICAgLnBhcmVudChhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkpXG4gICAgICAudGl0bGUoJ0NvbmZpcm0nKVxuICAgICAgLmNvbnRlbnQoJ1dvdWxkIHlvdSBsaWtlIHRvIGRlbGV0ZSB0aGlzIHJlcG8/JylcbiAgICAgIC5vaygnWWVzIScpXG4gICAgICAuY2FuY2VsKCdObyEnKTtcblxuXHRcdCRtZERpYWxvZy5zaG93KGNvbmZpcm0pLnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHQvL2FmdGVyIGNvbmZpcm0gZGVsZXRlXG5cdFx0XHRjb25zb2xlLmxvZygndXNlcnMgcmVwbycsICRzY29wZS51c2VyLnJlcG9zKVxuXHRcdFx0JHNjb3BlLnVzZXIucmVwb3MuZm9yRWFjaChmdW5jdGlvbih1c2VycmVwbywgaSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZygndXNlcnJlcG8gaW4gZGVsZXRlcmVwbyEhIScsIHVzZXJyZXBvLCByZXBvKVxuXHRcdFx0XHRpZiAodXNlcnJlcG8uX2lkID09PSByZXBvLl9pZCkgJHNjb3BlLnVzZXIucmVwb3Muc3BsaWNlKGksMSk7XG5cdFx0XHR9KVxuXHRcdFx0cG9wdXBHaXRGYWN0b3J5LmVkaXRSZXBvKCRzY29wZS51c2VyKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRjaHJvbWVSZWZyZXNoKCk7XG5cdFx0XHR9KVxuXG4gICAgfSk7XG5cblx0fVxuXG5cdCRzY29wZS5nb0FyY2hpdmUgPSBmdW5jdGlvbigpIHtcblx0XHQkc3RhdGUuZ28oJ2FyY2hpdmUnKTtcblx0fVxuXG5cdCRzY29wZS5hcmNoaXZlUmVwbyA9IGZ1bmN0aW9uKHJlcG8pIHtcblx0XHR2YXIgY29uZmlybSA9ICRtZERpYWxvZy5jb25maXJtKClcbiAgICAgIC5wYXJlbnQoYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpKVxuICAgICAgLnRpdGxlKCdDb25maXJtJylcbiAgICAgIC5jb250ZW50KCdXb3VsZCB5b3UgbGlrZSB0byBhcmNoaXZlIHRoaXMgcmVwbz8nKVxuICAgICAgLm9rKCdZZXMhJylcbiAgICAgIC5jYW5jZWwoJ05vIScpO1xuXG5cdFx0JG1kRGlhbG9nLnNob3coY29uZmlybSkudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdC8vYWZ0ZXIgY29uZmlybSB0byBhcmNoaXZlXG5cdFx0XHQvL2FkZCByZXBvIHRvIHVzZXIuYXJjaGl2ZXNcblx0XHRcdCRzY29wZS51c2VyLmFyY2hpdmVzLnB1c2gocmVwbyk7XG5cdFx0XHRjb25zb2xlLmxvZygkc2NvcGUudXNlci5hcmNoaXZlcyk7XG5cdFx0XHRwb3B1cEdpdEZhY3RvcnkuYXJjaGl2ZVJlcG8oJHNjb3BlLnVzZXIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdhcmNoaXZlZCB0byBkYicsIHJlcylcblx0XHRcdH0pXG5cblx0XHRcdC8vZGVsZXRlIHJlcG8gZnJvbSB1c2VyLnJlcG9zXG5cdFx0XHQkc2NvcGUudXNlci5yZXBvcy5mb3JFYWNoKGZ1bmN0aW9uKHVzZXJyZXBvLCBpKSB7XG5cdFx0XHRcdGlmICh1c2VycmVwby5faWQgPT09IHJlcG8uX2lkKSAkc2NvcGUudXNlci5yZXBvcy5zcGxpY2UoaSwxKTtcblx0XHRcdH0pXG5cdFx0XHRwb3B1cEdpdEZhY3RvcnkuZWRpdFJlcG8oJHNjb3BlLnVzZXIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdkZWxldGVkIHJlcG8nLCByZXMpXG5cdFx0XHR9KVxuXG4gICAgfSk7XG5cblx0fVxuXG5cdCRzY29wZS5nb1RvUmVwbyA9IGZ1bmN0aW9uKHJlcG8pIHtcblx0XHRjaHJvbWUudGFicy5jcmVhdGUoe1xuICAgICAgICB1cmw6IHJlcG8udXJsXG4gICAgfSk7XG5cdH1cblxuXHQvL2xpc3QgZmlsZXMgdW5kZXIgYSByZXBvXG5cdCRzY29wZS5saXN0RmlsZXMgPSBmdW5jdGlvbihyZXBvKSB7XG5cdFx0dmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9maWxlcy9maWxlLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0ZpbGVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgcmVwbzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcG87XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblx0fVxuXG5cdC8vbG9nIG91dFxuXHQkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuXHRcdHBvcHVwR2l0RmFjdG9yeS5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uKHJlcyl7XG5cdFx0XHQkc3RhdGUuZ28oJ2xvZ2luJyk7XG5cdFx0XHQvLyBjaHJvbWUudGFicy5xdWVyeSh7dGl0bGU6ICdIaWdobGlnaHQgWW91ciBXb3JsZCd9LCBmdW5jdGlvbih0YWJzKXtcbiAgIC8vICAgICAgICBcdFx0dGFicy5mb3JFYWNoKGZ1bmN0aW9uKHRhYil7XG4gICAvLyAgICAgICAgICBcdGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwgbWVzc2FnZTogJ2xvZ291dCcpO1xuICAgLy8gICAgICAgICAgXHR9KVxuICAgLy8gICAgICAgIFx0fSk7XG5cdFx0fSlcblx0fVxuXG5cdC8vc2lkZWJhclxuXHQkc2NvcGUudG9nZ2xlTGVmdCA9IGJ1aWxkVG9nZ2xlcignbGVmdCcpO1xuXG5cdGZ1bmN0aW9uIGJ1aWxkVG9nZ2xlcihuYXZJRCkge1xuICAgICAgdmFyIGRlYm91bmNlRm4gPSAgJG1kVXRpbC5kZWJvdW5jZShmdW5jdGlvbigpe1xuICAgICAgICAgICAgJG1kU2lkZW5hdihuYXZJRClcbiAgICAgICAgICAgICAgLnRvZ2dsZSgpXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKFwidG9nZ2xlIFwiICsgbmF2SUQgKyBcIiBpcyBkb25lXCIpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LDMwMCk7XG4gICAgICByZXR1cm4gZGVib3VuY2VGbjtcbiAgfVxuXG5cdCRzY29wZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRtZFNpZGVuYXYoJ2xlZnQnKS5jbG9zZSgpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkbG9nLmRlYnVnKFwiY2xvc2UgTEVGVCBpcyBkb25lXCIpO1xuICAgICAgICB9KTtcbiAgXHR9O1xuXG4gIFx0ZnVuY3Rpb24gY2hyb21lUmVmcmVzaCAoKSB7XG4gIFx0XHRjaHJvbWUudGFicy5xdWVyeSh7dGl0bGU6ICdIaWdobGlnaHQgWW91ciBXb3JsZCd9LCBmdW5jdGlvbih0YWJzKXtcblx0XHR0YWJzLmZvckVhY2goZnVuY3Rpb24odGFiKXtcblx0XHRcdGNocm9tZS50YWJzLnJlbG9hZCh0YWIuaWQpO1xuXHRcdFx0fSlcblx0XHR9KVxuICBcdH07XG5cbn0pXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XG5cdFx0dXJsOiAnLycsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvbG9naW4vbG9naW4uaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ0xvZ2luQ29udHJvbGxlcicsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0TG9naW46IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcblx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0XHRpZihyZXMuZGF0YSkge1xuXHRcdFx0XHRcdFx0JHN0YXRlLmdvKCdob21lJylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCBwb3B1cEdpdEZhY3Rvcnkpe1xuICAkc2NvcGUubWVzc2FnZSA9IFwiQ2hlY2sgdGhpcyBwYWdlIG91dCBub3chXCI7XG5cblx0Ly8gJHNjb3BlLmxvZ2dlZGluID0gZmFsc2U7XG5cblx0JHNjb3BlLmdpdExvZ2luID0gZnVuY3Rpb24oKSB7XG5cdFx0Ly9uZWVkIHRvIGNoYW5nZSBsb2NhbGhvc3Q6MTMzNyB0byB0aGUgYXBwcm9wcmlhdGUgZG9tYWluIG5hbWUgYWZ0ZXIgZGVwbG95bWVudCEhIVxuXHRcdGNvbnNvbGUubG9nKCdnaXRMb2dpbicpXG5cdFx0JHNjb3BlLlN1Y2Nlc3NmdWxMb2dpbigpO1xuXHRcdGNocm9tZS50YWJzLmNyZWF0ZSh7XG4gICAgICAgIHVybDogXCJodHRwOi8vbG9jYWxob3N0OjEzMzcvYXV0aC9naXRodWJcIlxuICAgIH0pO1xuXG5cdH1cblxuXG5cdC8vIGNvbnNvbGUubG9nKHNlc3Npb24pXG5cblxuXHQkc2NvcGUuU3VjY2Vzc2Z1bExvZ2luID0gZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coJ3N1Y2Nlc3N1ZmxseSBsb2dnaW4nKVxuXG5cdFx0JHN0YXRlLmdvKCdob21lJylcblx0XHRnZXROYW1lKCk7XG5cdFx0Ly8gJHNjb3BlLmxvZ2dlZGluID0gdHJ1ZTtcblx0fVxuXG5cdHZhciBnZXROYW1lID0gZnVuY3Rpb24oKSB7XG5cdFx0cG9wdXBHaXRGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnZ2V0TmFtZScsIGRhdGEpO1xuXHRcdFx0Ly8gJHNjb3BlLm5hbWUgPVxuXHRcdH0pXG5cdH1cbn0pXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=