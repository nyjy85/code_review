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

	// console.log('from the controller is the repo', repo)

	popupGitFactory.listFiles(repo).then(function(repo){

    $scope.fileCreated = repo.files[0].timestamp.slice(0,10);
		console.log('list files', repo)

		repo.files.forEach(function(file) {
			var url = file.fileUrl.split('/');
			file.display = url.slice(url.indexOf('blob')+1).join('/');
      // [url.length-2] + '/' + url[url.length-1];

      //number of comments
      $scope.commenters = [];
      $scope.displayCommenters = "";
      file.numComments = 0;
      file.highlighted.forEach(function(highlight) {
        file.numComments += highlight.comment.length
        highlight.comment.forEach(function(comment) {
          if ($scope.commenters.indexOf(comment.commenter) === -1) $scope.commenters.push(comment.commenter);
        })
      })
		})

    // $scope.commenters.forEach(function(commmenter) {
    //
    // })
    $scope.getRandomColor = function() {
      // var colors = {
      //   aqua: "#030303",
      //   red: "red"
      // }
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

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
		$scope.showNotification = !$scope.showNotification;
	}

	$scope.notifications = function () {
		popupGitFactory.getNotification($scope.user)
		.then(function(notifications) {

			notifications.map(function(n){
				console.log('notificatiosn!!!!!')
				var fileUrl = n.fileUrl;
				var url = fileUrl.split('/');
				n.repoName = url[4];
				n.file = url[url.length-2] + '/' + url[url.length-1];
				n.timestamp = Math.floor((Date.now() - Date.parse(n.timestamp))/1000/60) + 'min ago';
				if(n.line) n.line = n.line.slice(2);

				var message = [
					{update: 'newHighlight', display: ' added ' + n.number + ' new comments on '+ n.repoName + "(" + n.file + ")      "},
					{update: 'newComment', display: ' added '+ n.number + ' responses on ' + n.repoName + "(" + n.file +")"+' on line '+ n.line + "    "}
				]

				message.forEach(function(msg) {
					if (n.update === msg.update) {
						n.display = msg.display;
					}
				})
			})

			$scope.noti = notifications;
		})

	}

	$scope.openFile = function(url) {
		chrome.tabs.create({
        url: url
    });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZhY3Rvcmllcy9wb3B1cEdpdEZhY3RvcnkuanMiLCJzdGF0ZXMvYXJjaGl2ZS9hcmNoaXZlLmpzIiwic3RhdGVzL2ZpbGVzL2ZpbGUuanMiLCJzdGF0ZXMvaG9tZS9ob21lLmpzIiwic3RhdGVzL2xvZ2luL2xvZ2luLmpzIiwiZGlyZWN0aXZlcy9zZXR0aW5nQnV0dG9uL3NldHRpbmdCdXR0b24uanMiLCJkaXJlY3RpdmVzL3NpZGViYXIvc2lkZWJhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3REQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ0NvZGVSZXZpZXdFeHQnLCBbJ3VpLnJvdXRlcicsICd1aS5ib290c3RyYXAnLCAnbmdNYXRlcmlhbCddKTtcblxuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkbWRJY29uUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsICRjb21waWxlUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHtcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZUJhc2U6IGZhbHNlXG4gICAgfSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG4gICAgJG1kSWNvblByb3ZpZGVyXG4gICAgLmljb25TZXQoXCJjYWxsXCIsICdpbWcvaWNvbnMvY29tbXVuaWNhdGlvbi1pY29ucy5zdmcnLCAyNClcbiAgICAuaWNvblNldChcInNvY2lhbFwiLCAnaW1nL2ljb25zL3NvY2lhbC1pY29ucy5zdmcnLCAyNCk7XG5cblxuICAgIC8vIHdoaXRlbGlzdCB0aGUgY2hyb21lLWV4dGVuc2lvbjogcHJvdG9jb2xcbiAgICAvLyBzbyB0aGF0IGl0IGRvZXMgbm90IGFkZCBcInVuc2FmZTpcIlxuICAgICRjb21waWxlUHJvdmlkZXIuYUhyZWZTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8bWFpbHRvfGNocm9tZS1leHRlbnNpb24pOi8pO1xuICAgICRjb21waWxlUHJvdmlkZXIuaW1nU3JjU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfGZpbGV8bG9jYWx8Y2hyb21lLWV4dGVuc2lvbik6fGRhdGE6aW1hZ2VcXC8vKTtcblxufSk7XG5cblxuIiwiYXBwLmZhY3RvcnkoJ3BvcHVwR2l0RmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgdmFyIGRvbWFpbiA9IFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3XCI7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIGdldFVzZXJJbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGRvbWFpbiArIFwiL3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhLnVzZXI7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0UmVwb3NUb0FkZDogZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnaGl0IGdldHJlcG8nLCB0b2tlbilcbiAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGRvbWFpbiArIFwiL2FwaS9naXRcIiwge3BhcmFtczogdG9rZW59KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q29udHJpYnV0b3JzOiBmdW5jdGlvbihjb250cmlidXRvclVybCkge1xuICAgICAgICAgIHZhciBpID0gY29udHJpYnV0b3JVcmwubWF0Y2goL3JlcG9zLykuaW5kZXggKyA2O1xuICAgICAgICAgIHZhciByZXBvVXJsID0gY29udHJpYnV0b3JVcmwuc2xpY2UoaSwgLTEzKTtcbiAgICAgICAgICB2YXIgb3duZXIgPSByZXBvVXJsLnNwbGl0KCcvJylbMF07XG4gICAgICAgICAgdmFyIHJlcG8gPSByZXBvVXJsLnNwbGl0KCcvJylbMV07XG5cbiAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGRvbWFpbiArIFwiL2FwaS9naXQvcmVwb3MvXCIgKyBvd25lciArICcvJyArIHJlcG8gKyAnL2NvbnRyaWJ1dG9ycycpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICAvL2RlbGV0aW5nIHJlcG8gZnJvbSBwcm9maWxlXG4gICAgICAgIGVkaXRSZXBvOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2FkZFJlcG9Ub1Byb2ZpbGUgZmFjdG9yeScsdXNlci5yZXBvcylcbiAgICAgICAgICB2YXIgcmVwbyA9IHtyZXBvOiB1c2VyLnJlcG9zfVxuICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoZG9tYWluICsgXCIvYXBpL3VzZXJzL1wiICsgdXNlci5naXRodWIudXNlcm5hbWUgKyBcIi9lZGl0UmVwb1wiLCByZXBvKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgYXJjaGl2ZVJlcG86IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnYXJjaGlldmUgcmVwbyBmYWN0b3J5JywgdXNlci5hcmNoaXZlcyk7XG4gICAgICAgICAgdmFyIGFyY2hpdmVzID0ge3JlcG86IHVzZXIuYXJjaGl2ZXN9XG4gICAgICAgICAgcmV0dXJuICRodHRwLnB1dChkb21haW4gKyAnL2FwaS91c2Vycy8nICsgdXNlci5naXRodWIudXNlcm5hbWUgKyAnL2FyY2hpdmVSZXBvJywgYXJjaGl2ZXMpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBsaXN0RmlsZXM6IGZ1bmN0aW9uKHJlcG8pIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnbGlzdCBmaWxlIG5hbWVzIHVuZGVyIHRoZSByZXBvJywgcmVwbylcbiAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGRvbWFpbiArIFwiL2FwaS9yZXBvL2FsbFwiLCB7cGFyYW1zOiByZXBvfSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlcG9GaW5kT3JJbnNlcnQ6IGZ1bmN0aW9uKHJlcG8pIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnaXMgdGhlcmUgc3VjaCByZXBvPyBmYWN0b3J5JywgcmVwbylcbiAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGRvbWFpbiArIFwiL2FwaS9yZXBvL1wiLCB7cGFyYW1zOiByZXBvfSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Tm90aWZpY2F0aW9uOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyAnL2FwaS91c2Vycy8nICsgdXNlci5naXRodWIudXNlcm5hbWUgKyAnL25vdGlmaWNhdGlvbnMnKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9nb3V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnaGl0dGluZyB0aGUgZmFjdG9yeScpXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKycvbG9nb3V0JykudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICBcdFx0XHQgcmV0dXJuIFwiTG9nZ2VkIE91dFwiO1xuICAgIFx0XHR9KTtcbiAgICAgIH1cbiAgICB9XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhcmNoaXZlJywge1xuXHRcdHVybDogJy9hcmNoaXZlJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9hcmNoaXZlL2FyY2hpdmUuaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ0FyY2hpdmVDdHJsJyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRBdXRoZW50aWNhdGU6IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcblx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0XHRpZiAocmVzLmRhdGEpIHtcblx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn0pO1xuXG4vL2FkZCBGYWN0b3J5XG5hcHAuY29udHJvbGxlcignQXJjaGl2ZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJG1kRGlhbG9nKSB7XG5cbiAgcG9wdXBHaXRGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbih1c2VyKSB7XG5cdFx0JHNjb3BlLnVzZXIgPSB1c2VyLnVzZXI7XG4gICAgJHNjb3BlLnNob3dBcmNoID0gJHNjb3BlLnVzZXIuYXJjaGl2ZXM7XG5cdH0pXG5cblxuXG59KVxuIiwiJ3VzZSBzdHJpY3QnO1xuLy8gYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbi8vIFx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2ZpbGUnLCB7XG4vLyBcdFx0dXJsOiAnL2ZpbGUnLFxuLy8gXHRcdHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2ZpbGVzL2ZpbGUuaHRtbCcsXG4vLyBcdFx0Y29udHJvbGxlcjogJ0ZpbGVDdHJsJyxcbi8vIFx0XHRyZXNvbHZlOiB7XG4vLyBcdFx0XHRBdXRoZW50aWNhdGU6IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcbi8vIFx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcbi8vIFx0XHRcdFx0XHRpZiAocmVzLmRhdGEpIHtcbi8vIFx0XHRcdFx0XHRcdHJldHVyblxuLy8gXHRcdFx0XHRcdH1cbi8vIFx0XHRcdFx0XHRlbHNlIHtcbi8vIFx0XHRcdFx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKVxuLy8gXHRcdFx0XHRcdH1cbi8vIFx0XHRcdFx0fSk7XG4vLyBcdFx0XHR9XG4vLyBcdFx0fVxuLy8gXHR9KTtcbi8vIH0pO1xuXG4vL2FkZCBGYWN0b3J5XG5hcHAuY29udHJvbGxlcignRmlsZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJG1vZGFsSW5zdGFuY2UsIHJlcG8sICRtZERpYWxvZykge1xuXG4gIHBvcHVwR2l0RmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24odXNlcikge1xuXHRcdCRzY29wZS51c2VyID0gdXNlci51c2VyO1xuXHRcdCRzY29wZS5kaXNwbGF5TmFtZSA9ICRzY29wZS51c2VyLmdpdGh1Yi5uYW1lO1xuXG5cdH0pXG5cblx0JHNjb3BlLnJlcG9OYW1lID0gcmVwby5uYW1lO1xuXG5cdC8vIGNvbnNvbGUubG9nKCdmcm9tIHRoZSBjb250cm9sbGVyIGlzIHRoZSByZXBvJywgcmVwbylcblxuXHRwb3B1cEdpdEZhY3RvcnkubGlzdEZpbGVzKHJlcG8pLnRoZW4oZnVuY3Rpb24ocmVwbyl7XG5cbiAgICAkc2NvcGUuZmlsZUNyZWF0ZWQgPSByZXBvLmZpbGVzWzBdLnRpbWVzdGFtcC5zbGljZSgwLDEwKTtcblx0XHRjb25zb2xlLmxvZygnbGlzdCBmaWxlcycsIHJlcG8pXG5cblx0XHRyZXBvLmZpbGVzLmZvckVhY2goZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0dmFyIHVybCA9IGZpbGUuZmlsZVVybC5zcGxpdCgnLycpO1xuXHRcdFx0ZmlsZS5kaXNwbGF5ID0gdXJsLnNsaWNlKHVybC5pbmRleE9mKCdibG9iJykrMSkuam9pbignLycpO1xuICAgICAgLy8gW3VybC5sZW5ndGgtMl0gKyAnLycgKyB1cmxbdXJsLmxlbmd0aC0xXTtcblxuICAgICAgLy9udW1iZXIgb2YgY29tbWVudHNcbiAgICAgICRzY29wZS5jb21tZW50ZXJzID0gW107XG4gICAgICAkc2NvcGUuZGlzcGxheUNvbW1lbnRlcnMgPSBcIlwiO1xuICAgICAgZmlsZS5udW1Db21tZW50cyA9IDA7XG4gICAgICBmaWxlLmhpZ2hsaWdodGVkLmZvckVhY2goZnVuY3Rpb24oaGlnaGxpZ2h0KSB7XG4gICAgICAgIGZpbGUubnVtQ29tbWVudHMgKz0gaGlnaGxpZ2h0LmNvbW1lbnQubGVuZ3RoXG4gICAgICAgIGhpZ2hsaWdodC5jb21tZW50LmZvckVhY2goZnVuY3Rpb24oY29tbWVudCkge1xuICAgICAgICAgIGlmICgkc2NvcGUuY29tbWVudGVycy5pbmRleE9mKGNvbW1lbnQuY29tbWVudGVyKSA9PT0gLTEpICRzY29wZS5jb21tZW50ZXJzLnB1c2goY29tbWVudC5jb21tZW50ZXIpO1xuICAgICAgICB9KVxuICAgICAgfSlcblx0XHR9KVxuXG4gICAgLy8gJHNjb3BlLmNvbW1lbnRlcnMuZm9yRWFjaChmdW5jdGlvbihjb21tbWVudGVyKSB7XG4gICAgLy9cbiAgICAvLyB9KVxuICAgICRzY29wZS5nZXRSYW5kb21Db2xvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gdmFyIGNvbG9ycyA9IHtcbiAgICAgIC8vICAgYXF1YTogXCIjMDMwMzAzXCIsXG4gICAgICAvLyAgIHJlZDogXCJyZWRcIlxuICAgICAgLy8gfVxuICAgICAgdmFyIGxldHRlcnMgPSAnMDEyMzQ1Njc4OUFCQ0RFRicuc3BsaXQoJycpO1xuICAgICAgdmFyIGNvbG9yID0gJyMnO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2OyBpKysgKSB7XG4gICAgICAgICAgY29sb3IgKz0gbGV0dGVyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNildO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbG9yO1xuICAgIH1cblxuXHRcdCRzY29wZS5maWxlc1VuZGVyUmVwbyA9IHJlcG8uZmlsZXM7XG5cdH0pXG5cblxuXHQvLyAkc2NvcGUuc2hvd1lvdXJGaWxlcyA9ICRzY29wZS51c2VyLnJlcG9zO1xuXG5cdCRzY29wZS5nb1RvRmlsZSA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRjaHJvbWUudGFicy5jcmVhdGUoe1xuICAgICAgICB1cmw6IGZpbGUuZmlsZVVybFxuICAgIH0pO1xuXHR9XG5cblx0JHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gIH1cblxuXG59KVxuXG5cblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL255ank4NS9jb2RlX3Jldmlldy9jb21taXQvNGUwZjdlYzMzNTM5ODA0MzE2ZGZmZjc4NmI4MGJlODZkZTY3MmVhNFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL255ank4NS9jb2RlX3Jldmlldy9ibG9iL3JpZ2h0Q2xpY2svYnJvd3Nlci9zY3NzL2hvbWUvbWFpbi5zY3NzXG5cbi8vIEJyYW5jaDogcmlnaHRDbGlja1xuLy8gUmVwbyBOYW1lOiBjb2RlX3Jldmlld1xuLy8gRmlsZXM6IC9icm93c2VyL3Njc3MvaG9tZS9tYWluLnNjc3NcbiIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuXHRcdHVybDogJy9ob21lJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9ob21lL2hvbWUuaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ0hvbWVDdHJsJyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRBdXRoZW50aWNhdGU6IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcblx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0XHRpZiAocmVzLmRhdGEpIHtcblx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignSG9tZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJHRpbWVvdXQsICRtZFNpZGVuYXYsICRtZFV0aWwsICR0aW1lb3V0LCAkcSwgJGxvZywgJG1vZGFsLCAkbWREaWFsb2cpIHtcblxuXG5cdCRzY29wZS5yZXBvc0xvYWRlZCA9IHBvcHVwR2l0RmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24odXNlcikge1xuXHRcdCRzY29wZS51c2VyID0gdXNlcjtcblx0XHQkc2NvcGUudG9rZW5PYmogPSB7dG9rZW46ICRzY29wZS51c2VyLmdpdGh1Yi50b2tlbn07XG5cdFx0JHNjb3BlLnNob3dSZXBvcyA9ICRzY29wZS51c2VyLnJlcG9zO1xuXHRcdCRzY29wZS5ub3RpTnVtID0gJHNjb3BlLnVzZXIubm90aWZpY2F0aW9ucy5sZW5ndGg7XG5cdFx0cmV0dXJuICRzY29wZS5sb2FkUmVwb3MoKTtcblx0fSlcblxuXHQkc2NvcGUubG9hZFJlcG9zID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBwb3B1cEdpdEZhY3RvcnkuZ2V0UmVwb3NUb0FkZCgkc2NvcGUudG9rZW5PYmopXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVwb3MpIHtcblx0XHRcdFx0JHNjb3BlLnJlcG9zVG9BZGQgPSByZXBvcztcblx0XHRcdFx0cmV0dXJuIHJlcG9zO1xuXHRcdH0pXG5cdH1cblxuXHQkc2NvcGUucXVlcnlTZWFyY2ggPSBmdW5jdGlvbiAocXVlcnkpIHtcblxuXHRcdHJldHVybiAkc2NvcGUucmVwb3NMb2FkZWQudGhlbihmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHF1ZXJ5ID8gJHNjb3BlLnJlcG9zVG9BZGQuZmlsdGVyKGZpbHRlckZuKSA6ICRzY29wZS5yZXBvc1RvQWRkO1xuXHRcdH0pO1xuXG5cdFx0ZnVuY3Rpb24gZmlsdGVyRm4ocmVwbykge1xuXHRcdFx0cmV0dXJuIChyZXBvLm5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKGFuZ3VsYXIubG93ZXJjYXNlKHF1ZXJ5KSkgPT09IDApO1xuXHRcdH07XG5cdH1cblxuXHQkc2NvcGUudG9nZ2xlQWRkQmFyID0gZnVuY3Rpb24gKCkge1xuXHRcdCRzY29wZS5zaG93QWRkQmFyID0gISRzY29wZS5zaG93QWRkQmFyO1xuXHR9XG5cblx0JHNjb3BlLnRvZ2dsZU5vdGlmaWNhdGlvbiA9IGZ1bmN0aW9uICgpIHtcblx0XHQkc2NvcGUuc2hvd05vdGlmaWNhdGlvbiA9ICEkc2NvcGUuc2hvd05vdGlmaWNhdGlvbjtcblx0fVxuXG5cdCRzY29wZS5ub3RpZmljYXRpb25zID0gZnVuY3Rpb24gKCkge1xuXHRcdHBvcHVwR2l0RmFjdG9yeS5nZXROb3RpZmljYXRpb24oJHNjb3BlLnVzZXIpXG5cdFx0LnRoZW4oZnVuY3Rpb24obm90aWZpY2F0aW9ucykge1xuXG5cdFx0XHRub3RpZmljYXRpb25zLm1hcChmdW5jdGlvbihuKXtcblx0XHRcdFx0Y29uc29sZS5sb2coJ25vdGlmaWNhdGlvc24hISEhIScpXG5cdFx0XHRcdHZhciBmaWxlVXJsID0gbi5maWxlVXJsO1xuXHRcdFx0XHR2YXIgdXJsID0gZmlsZVVybC5zcGxpdCgnLycpO1xuXHRcdFx0XHRuLnJlcG9OYW1lID0gdXJsWzRdO1xuXHRcdFx0XHRuLmZpbGUgPSB1cmxbdXJsLmxlbmd0aC0yXSArICcvJyArIHVybFt1cmwubGVuZ3RoLTFdO1xuXHRcdFx0XHRuLnRpbWVzdGFtcCA9IE1hdGguZmxvb3IoKERhdGUubm93KCkgLSBEYXRlLnBhcnNlKG4udGltZXN0YW1wKSkvMTAwMC82MCkgKyAnbWluIGFnbyc7XG5cdFx0XHRcdGlmKG4ubGluZSkgbi5saW5lID0gbi5saW5lLnNsaWNlKDIpO1xuXG5cdFx0XHRcdHZhciBtZXNzYWdlID0gW1xuXHRcdFx0XHRcdHt1cGRhdGU6ICduZXdIaWdobGlnaHQnLCBkaXNwbGF5OiAnIGFkZGVkICcgKyBuLm51bWJlciArICcgbmV3IGNvbW1lbnRzIG9uICcrIG4ucmVwb05hbWUgKyBcIihcIiArIG4uZmlsZSArIFwiKSAgICAgIFwifSxcblx0XHRcdFx0XHR7dXBkYXRlOiAnbmV3Q29tbWVudCcsIGRpc3BsYXk6ICcgYWRkZWQgJysgbi5udW1iZXIgKyAnIHJlc3BvbnNlcyBvbiAnICsgbi5yZXBvTmFtZSArIFwiKFwiICsgbi5maWxlICtcIilcIisnIG9uIGxpbmUgJysgbi5saW5lICsgXCIgICAgXCJ9XG5cdFx0XHRcdF1cblxuXHRcdFx0XHRtZXNzYWdlLmZvckVhY2goZnVuY3Rpb24obXNnKSB7XG5cdFx0XHRcdFx0aWYgKG4udXBkYXRlID09PSBtc2cudXBkYXRlKSB7XG5cdFx0XHRcdFx0XHRuLmRpc3BsYXkgPSBtc2cuZGlzcGxheTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHR9KVxuXG5cdFx0XHQkc2NvcGUubm90aSA9IG5vdGlmaWNhdGlvbnM7XG5cdFx0fSlcblxuXHR9XG5cblx0JHNjb3BlLm9wZW5GaWxlID0gZnVuY3Rpb24odXJsKSB7XG5cdFx0Y2hyb21lLnRhYnMuY3JlYXRlKHtcbiAgICAgICAgdXJsOiB1cmxcbiAgICB9KTtcblx0fVxuXG5cdHZhciBjYW5ub3RBZGRCb3ggPSBmdW5jdGlvbiAoKSB7XG5cdFx0JG1kRGlhbG9nLnNob3coXG5cdFx0JG1kRGlhbG9nLmFsZXJ0KClcblx0XHRcdC5wYXJlbnQoYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpKVxuXHRcdFx0LnRpdGxlKCdVbmZvcnR1bmF0ZWx5Jylcblx0XHRcdC5jb250ZW50KCdZb3UgY2Fubm90IGFkZCBhIHJlcG8geW91IGFscmVhZHkgYWRkZWQuJylcblx0XHRcdC5vaygnR290IGl0IScpXG5cdFx0KTtcblx0fVxuXG5cdCRzY29wZS5hZGRSZXBvID0gZnVuY3Rpb24gKHJlcG8pIHtcblx0XHRcdCRzY29wZS5yZXBvU2VsZWN0ZWQgPSBudWxsO1xuXG5cdFx0XHRwb3B1cEdpdEZhY3RvcnkuZ2V0Q29udHJpYnV0b3JzKHJlcG8uY29udHJpYnV0b3JzX3VybClcblx0XHRcdC50aGVuKGZ1bmN0aW9uKG5hbWVzKSB7XG5cdFx0XHRcdHJlcG8uY29udHJpYnV0b3JzID0gbmFtZXM7XG5cblx0XHRcdFx0dmFyIHNhdmVyZXBvID0ge25hbWU6IHJlcG8ubmFtZSwgdXJsOiByZXBvLmh0bWxfdXJsLCBjb250cmlidXRvcnM6IHJlcG8uY29udHJpYnV0b3JzfVxuXG5cdFx0XHRcdC8vY3JlYXRlIFJlcG8gaWYgaXQgZG9lc24ndCBleGlzdCBpbiB0aGUgUmVwby5kYiArIGFkZCByZXBvIHRvIFVzZXIuZGJcblx0XHRcdFx0cG9wdXBHaXRGYWN0b3J5LnJlcG9GaW5kT3JJbnNlcnQoc2F2ZXJlcG8pLnRoZW4oZnVuY3Rpb24ocmVzRGF0YSkge1xuXHRcdFx0XHRcdGlmKCFyZXNEYXRhLnVzZXJBbHJlYWR5SGFkKSB7XG5cdFx0XHRcdFx0XHQkc2NvcGUudXNlci5yZXBvcy5wdXNoKHJlc0RhdGEucmVwbyk7XG5cdFx0XHRcdFx0XHRjaHJvbWVSZWZyZXNoKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgY2Fubm90QWRkQm94KCk7XG5cblx0XHRcdFx0fSlcblx0XHRcdH0pXG5cblx0fVxuXG5cdCRzY29wZS5kZWxldGVSZXBvID0gZnVuY3Rpb24ocmVwbykge1xuXHRcdGNvbnNvbGUubG9nKCdkZWxldGluZyByZXBvJylcblxuXHRcdHZhciBjb25maXJtID0gJG1kRGlhbG9nLmNvbmZpcm0oKVxuICAgICAgLnBhcmVudChhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkpXG4gICAgICAudGl0bGUoJ0NvbmZpcm0nKVxuICAgICAgLmNvbnRlbnQoJ1dvdWxkIHlvdSBsaWtlIHRvIGRlbGV0ZSB0aGlzIHJlcG8/JylcbiAgICAgIC5vaygnWWVzIScpXG4gICAgICAuY2FuY2VsKCdObyEnKTtcblxuXHRcdCRtZERpYWxvZy5zaG93KGNvbmZpcm0pLnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHQvL2FmdGVyIGNvbmZpcm0gZGVsZXRlXG5cdFx0XHRjb25zb2xlLmxvZygndXNlcnMgcmVwbycsICRzY29wZS51c2VyLnJlcG9zKVxuXHRcdFx0JHNjb3BlLnVzZXIucmVwb3MuZm9yRWFjaChmdW5jdGlvbih1c2VycmVwbywgaSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZygndXNlcnJlcG8gaW4gZGVsZXRlcmVwbyEhIScsIHVzZXJyZXBvLCByZXBvKVxuXHRcdFx0XHRpZiAodXNlcnJlcG8uX2lkID09PSByZXBvLl9pZCkgJHNjb3BlLnVzZXIucmVwb3Muc3BsaWNlKGksMSk7XG5cdFx0XHR9KVxuXHRcdFx0cG9wdXBHaXRGYWN0b3J5LmVkaXRSZXBvKCRzY29wZS51c2VyKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRjaHJvbWVSZWZyZXNoKCk7XG5cdFx0XHR9KVxuXG4gICAgfSk7XG5cblx0fVxuXG5cdCRzY29wZS5nb0FyY2hpdmUgPSBmdW5jdGlvbigpIHtcblx0XHQkc3RhdGUuZ28oJ2FyY2hpdmUnKTtcblx0fVxuXG5cdCRzY29wZS5hcmNoaXZlUmVwbyA9IGZ1bmN0aW9uKHJlcG8pIHtcblx0XHR2YXIgY29uZmlybSA9ICRtZERpYWxvZy5jb25maXJtKClcbiAgICAgIC5wYXJlbnQoYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpKVxuICAgICAgLnRpdGxlKCdDb25maXJtJylcbiAgICAgIC5jb250ZW50KCdXb3VsZCB5b3UgbGlrZSB0byBhcmNoaXZlIHRoaXMgcmVwbz8nKVxuICAgICAgLm9rKCdZZXMhJylcbiAgICAgIC5jYW5jZWwoJ05vIScpO1xuXG5cdFx0JG1kRGlhbG9nLnNob3coY29uZmlybSkudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdC8vYWZ0ZXIgY29uZmlybSB0byBhcmNoaXZlXG5cdFx0XHQvL2FkZCByZXBvIHRvIHVzZXIuYXJjaGl2ZXNcblx0XHRcdCRzY29wZS51c2VyLmFyY2hpdmVzLnB1c2gocmVwbyk7XG5cdFx0XHRjb25zb2xlLmxvZygkc2NvcGUudXNlci5hcmNoaXZlcyk7XG5cdFx0XHRwb3B1cEdpdEZhY3RvcnkuYXJjaGl2ZVJlcG8oJHNjb3BlLnVzZXIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdhcmNoaXZlZCB0byBkYicsIHJlcylcblx0XHRcdH0pXG5cblx0XHRcdC8vZGVsZXRlIHJlcG8gZnJvbSB1c2VyLnJlcG9zXG5cdFx0XHQkc2NvcGUudXNlci5yZXBvcy5mb3JFYWNoKGZ1bmN0aW9uKHVzZXJyZXBvLCBpKSB7XG5cdFx0XHRcdGlmICh1c2VycmVwby5faWQgPT09IHJlcG8uX2lkKSAkc2NvcGUudXNlci5yZXBvcy5zcGxpY2UoaSwxKTtcblx0XHRcdH0pXG5cdFx0XHRwb3B1cEdpdEZhY3RvcnkuZWRpdFJlcG8oJHNjb3BlLnVzZXIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdkZWxldGVkIHJlcG8nLCByZXMpXG5cdFx0XHR9KVxuXG4gICAgfSk7XG5cblx0fVxuXG5cdCRzY29wZS5nb1RvUmVwbyA9IGZ1bmN0aW9uKHJlcG8pIHtcblx0XHRjaHJvbWUudGFicy5jcmVhdGUoe1xuICAgICAgICB1cmw6IHJlcG8udXJsXG4gICAgfSk7XG5cdH1cblxuXHQvL2xpc3QgZmlsZXMgdW5kZXIgYSByZXBvXG5cdCRzY29wZS5saXN0RmlsZXMgPSBmdW5jdGlvbihyZXBvKSB7XG5cdFx0dmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9maWxlcy9maWxlLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0ZpbGVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgcmVwbzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcG87XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblx0fVxuXG5cdC8vbG9nIG91dFxuXHQkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuXHRcdHBvcHVwR2l0RmFjdG9yeS5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uKHJlcyl7XG5cdFx0XHQkc3RhdGUuZ28oJ2xvZ2luJyk7XG5cdFx0XHQvLyBjaHJvbWUudGFicy5xdWVyeSh7dGl0bGU6ICdIaWdobGlnaHQgWW91ciBXb3JsZCd9LCBmdW5jdGlvbih0YWJzKXtcbiAgIC8vICAgICAgICBcdFx0dGFicy5mb3JFYWNoKGZ1bmN0aW9uKHRhYil7XG4gICAvLyAgICAgICAgICBcdGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwgbWVzc2FnZTogJ2xvZ291dCcpO1xuICAgLy8gICAgICAgICAgXHR9KVxuICAgLy8gICAgICAgIFx0fSk7XG5cdFx0fSlcblx0fVxuXG5cdC8vc2lkZWJhclxuXHQkc2NvcGUudG9nZ2xlTGVmdCA9IGJ1aWxkVG9nZ2xlcignbGVmdCcpO1xuXG5cdGZ1bmN0aW9uIGJ1aWxkVG9nZ2xlcihuYXZJRCkge1xuICAgICAgdmFyIGRlYm91bmNlRm4gPSAgJG1kVXRpbC5kZWJvdW5jZShmdW5jdGlvbigpe1xuICAgICAgICAgICAgJG1kU2lkZW5hdihuYXZJRClcbiAgICAgICAgICAgICAgLnRvZ2dsZSgpXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKFwidG9nZ2xlIFwiICsgbmF2SUQgKyBcIiBpcyBkb25lXCIpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LDMwMCk7XG4gICAgICByZXR1cm4gZGVib3VuY2VGbjtcbiAgfVxuXG5cdCRzY29wZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRtZFNpZGVuYXYoJ2xlZnQnKS5jbG9zZSgpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkbG9nLmRlYnVnKFwiY2xvc2UgTEVGVCBpcyBkb25lXCIpO1xuICAgICAgICB9KTtcbiAgXHR9O1xuXG4gIFx0ZnVuY3Rpb24gY2hyb21lUmVmcmVzaCAoKSB7XG4gIFx0XHRjaHJvbWUudGFicy5xdWVyeSh7dGl0bGU6ICdIaWdobGlnaHQgWW91ciBXb3JsZCd9LCBmdW5jdGlvbih0YWJzKXtcblx0XHR0YWJzLmZvckVhY2goZnVuY3Rpb24odGFiKXtcblx0XHRcdGNocm9tZS50YWJzLnJlbG9hZCh0YWIuaWQpO1xuXHRcdFx0fSlcblx0XHR9KVxuICBcdH07XG5cbn0pXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XG5cdFx0dXJsOiAnLycsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvbG9naW4vbG9naW4uaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ0xvZ2luQ29udHJvbGxlcicsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0TG9naW46IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcblx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0XHRpZihyZXMuZGF0YSkge1xuXHRcdFx0XHRcdFx0JHN0YXRlLmdvKCdob21lJylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCBwb3B1cEdpdEZhY3Rvcnkpe1xuICAkc2NvcGUubWVzc2FnZSA9IFwiQ2hlY2sgdGhpcyBwYWdlIG91dCBub3chXCI7XG5cblx0Ly8gJHNjb3BlLmxvZ2dlZGluID0gZmFsc2U7XG5cblx0JHNjb3BlLmdpdExvZ2luID0gZnVuY3Rpb24oKSB7XG5cdFx0Ly9uZWVkIHRvIGNoYW5nZSBsb2NhbGhvc3Q6MTMzNyB0byB0aGUgYXBwcm9wcmlhdGUgZG9tYWluIG5hbWUgYWZ0ZXIgZGVwbG95bWVudCEhIVxuXHRcdGNvbnNvbGUubG9nKCdnaXRMb2dpbicpXG5cdFx0JHNjb3BlLlN1Y2Nlc3NmdWxMb2dpbigpO1xuXHRcdGNocm9tZS50YWJzLmNyZWF0ZSh7XG4gICAgICAgIHVybDogXCJodHRwOi8vbG9jYWxob3N0OjEzMzcvYXV0aC9naXRodWJcIlxuICAgIH0pO1xuXG5cdH1cblxuXG5cdC8vIGNvbnNvbGUubG9nKHNlc3Npb24pXG5cblxuXHQkc2NvcGUuU3VjY2Vzc2Z1bExvZ2luID0gZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coJ3N1Y2Nlc3N1ZmxseSBsb2dnaW4nKVxuXG5cdFx0JHN0YXRlLmdvKCdob21lJylcblx0XHRnZXROYW1lKCk7XG5cdFx0Ly8gJHNjb3BlLmxvZ2dlZGluID0gdHJ1ZTtcblx0fVxuXG5cdHZhciBnZXROYW1lID0gZnVuY3Rpb24oKSB7XG5cdFx0cG9wdXBHaXRGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnZ2V0TmFtZScsIGRhdGEpO1xuXHRcdFx0Ly8gJHNjb3BlLm5hbWUgPVxuXHRcdH0pXG5cdH1cbn0pXG4iLCIiLCIvLyAndXNlIHN0cmljdCc7XG4vLyBhcHAuZGlyZWN0aXZlKCdzaWRlYmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzdGF0ZSwgcG9wdXBHaXRGYWN0b3J5LCAkdGltZW91dCwgJG1kU2lkZW5hdiwgJGxvZykge1xuLy9cbi8vICAgICByZXR1cm4ge1xuLy8gICAgICAgICByZXN0cmljdDogJ0UnLFxuLy8gICAgICAgICBzY29wZToge30sXG4vLyAgICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvc2lkZWJhci9zaWRlYmFyLmh0bWwnLFxuLy8gICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcbi8vXG4vLyAgICAgICAgICAgc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAgICAgJG1kU2lkZW5hdigncmlnaHQnKS5jbG9zZSgpXG4vLyAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAgICAgICAgICRsb2cuZGVidWcoXCJjbG9zZSBMRUZUIGlzIGRvbmVcIik7XG4vLyAgICAgICAgICAgICB9KTtcbi8vICAgICAgICAgICB9O1xuLy9cbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vXG4vLyAgIH1cbi8vIH0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9