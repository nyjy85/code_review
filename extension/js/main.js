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
			file.display = url[url.length-2] + '/' + url[url.length-1];

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZhY3Rvcmllcy9wb3B1cEdpdEZhY3RvcnkuanMiLCJkaXJlY3RpdmVzL3NldHRpbmdCdXR0b24vc2V0dGluZ0J1dHRvbi5qcyIsImRpcmVjdGl2ZXMvc2lkZWJhci9zaWRlYmFyLmpzIiwic3RhdGVzL2ZpbGVzL2ZpbGUuanMiLCJzdGF0ZXMvYXJjaGl2ZS9hcmNoaXZlLmpzIiwic3RhdGVzL2hvbWUvaG9tZS5qcyIsInN0YXRlcy9sb2dpbi9sb2dpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakZBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdDb2RlUmV2aWV3RXh0JywgWyd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nTWF0ZXJpYWwnXSk7XG5cblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJG1kSWNvblByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHJlcXVpcmVCYXNlOiBmYWxzZVxuICAgIH0pO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcblxuICAgICRtZEljb25Qcm92aWRlclxuICAgIC5pY29uU2V0KFwiY2FsbFwiLCAnaW1nL2ljb25zL2NvbW11bmljYXRpb24taWNvbnMuc3ZnJywgMjQpXG4gICAgLmljb25TZXQoXCJzb2NpYWxcIiwgJ2ltZy9pY29ucy9zb2NpYWwtaWNvbnMuc3ZnJywgMjQpO1xuXG5cbiAgICAvLyB3aGl0ZWxpc3QgdGhlIGNocm9tZS1leHRlbnNpb246IHByb3RvY29sXG4gICAgLy8gc28gdGhhdCBpdCBkb2VzIG5vdCBhZGQgXCJ1bnNhZmU6XCJcbiAgICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3xjaHJvbWUtZXh0ZW5zaW9uKTovKTtcbiAgICAkY29tcGlsZVByb3ZpZGVyLmltZ1NyY1Nhbml0aXphdGlvbldoaXRlbGlzdCgvXlxccyooaHR0cHM/fGZ0cHxmaWxlfGxvY2FsfGNocm9tZS1leHRlbnNpb24pOnxkYXRhOmltYWdlXFwvLyk7XG5cbn0pO1xuXG5cbiIsImFwcC5mYWN0b3J5KCdwb3B1cEdpdEZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCkge1xuICAgIHZhciBkb21haW4gPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MTMzN1wiO1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICBnZXRVc2VySW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9zZXNzaW9uXCIpLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YS51c2VyO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFJlcG9zVG9BZGQ6IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2hpdCBnZXRyZXBvJywgdG9rZW4pXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9hcGkvZ2l0XCIsIHtwYXJhbXM6IHRva2VufSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldENvbnRyaWJ1dG9yczogZnVuY3Rpb24oY29udHJpYnV0b3JVcmwpIHtcbiAgICAgICAgICB2YXIgaSA9IGNvbnRyaWJ1dG9yVXJsLm1hdGNoKC9yZXBvcy8pLmluZGV4ICsgNjtcbiAgICAgICAgICB2YXIgcmVwb1VybCA9IGNvbnRyaWJ1dG9yVXJsLnNsaWNlKGksIC0xMyk7XG4gICAgICAgICAgdmFyIG93bmVyID0gcmVwb1VybC5zcGxpdCgnLycpWzBdO1xuICAgICAgICAgIHZhciByZXBvID0gcmVwb1VybC5zcGxpdCgnLycpWzFdO1xuXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9hcGkvZ2l0L3JlcG9zL1wiICsgb3duZXIgKyAnLycgKyByZXBvICsgJy9jb250cmlidXRvcnMnKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgLy9kZWxldGluZyByZXBvIGZyb20gcHJvZmlsZVxuICAgICAgICBlZGl0UmVwbzogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdhZGRSZXBvVG9Qcm9maWxlIGZhY3RvcnknLHVzZXIucmVwb3MpXG4gICAgICAgICAgdmFyIHJlcG8gPSB7cmVwbzogdXNlci5yZXBvc31cbiAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KGRvbWFpbiArIFwiL2FwaS91c2Vycy9cIiArIHVzZXIuZ2l0aHViLnVzZXJuYW1lICsgXCIvZWRpdFJlcG9cIiwgcmVwbylcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGFyY2hpdmVSZXBvOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2FyY2hpZXZlIHJlcG8gZmFjdG9yeScsIHVzZXIuYXJjaGl2ZXMpO1xuICAgICAgICAgIHZhciBhcmNoaXZlcyA9IHtyZXBvOiB1c2VyLmFyY2hpdmVzfVxuICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoZG9tYWluICsgJy9hcGkvdXNlcnMvJyArIHVzZXIuZ2l0aHViLnVzZXJuYW1lICsgJy9hcmNoaXZlUmVwbycsIGFyY2hpdmVzKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgbGlzdEZpbGVzOiBmdW5jdGlvbihyZXBvKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2xpc3QgZmlsZSBuYW1lcyB1bmRlciB0aGUgcmVwbycsIHJlcG8pXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9hcGkvcmVwby9hbGxcIiwge3BhcmFtczogcmVwb30pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICByZXBvRmluZE9ySW5zZXJ0OiBmdW5jdGlvbihyZXBvKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2lzIHRoZXJlIHN1Y2ggcmVwbz8gZmFjdG9yeScsIHJlcG8pXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9hcGkvcmVwby9cIiwge3BhcmFtczogcmVwb30pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldE5vdGlmaWNhdGlvbjogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgJy9hcGkvdXNlcnMvJyArIHVzZXIuZ2l0aHViLnVzZXJuYW1lICsgJy9ub3RpZmljYXRpb25zJylcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGxvZ291dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2hpdHRpbmcgdGhlIGZhY3RvcnknKVxuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgXHRcdFx0IHJldHVybiBcIkxvZ2dlZCBPdXRcIjtcbiAgICBcdFx0fSk7XG4gICAgICB9XG4gICAgfVxufSk7XG4iLCIiLCIvLyAndXNlIHN0cmljdCc7XG4vLyBhcHAuZGlyZWN0aXZlKCdzaWRlYmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzdGF0ZSwgcG9wdXBHaXRGYWN0b3J5LCAkdGltZW91dCwgJG1kU2lkZW5hdiwgJGxvZykge1xuLy9cbi8vICAgICByZXR1cm4ge1xuLy8gICAgICAgICByZXN0cmljdDogJ0UnLFxuLy8gICAgICAgICBzY29wZToge30sXG4vLyAgICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvc2lkZWJhci9zaWRlYmFyLmh0bWwnLFxuLy8gICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcbi8vXG4vLyAgICAgICAgICAgc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAgICAgJG1kU2lkZW5hdigncmlnaHQnKS5jbG9zZSgpXG4vLyAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAgICAgICAgICRsb2cuZGVidWcoXCJjbG9zZSBMRUZUIGlzIGRvbmVcIik7XG4vLyAgICAgICAgICAgICB9KTtcbi8vICAgICAgICAgICB9O1xuLy9cbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vXG4vLyAgIH1cbi8vIH0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLy8gYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbi8vIFx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2ZpbGUnLCB7XG4vLyBcdFx0dXJsOiAnL2ZpbGUnLFxuLy8gXHRcdHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2ZpbGVzL2ZpbGUuaHRtbCcsXG4vLyBcdFx0Y29udHJvbGxlcjogJ0ZpbGVDdHJsJyxcbi8vIFx0XHRyZXNvbHZlOiB7XG4vLyBcdFx0XHRBdXRoZW50aWNhdGU6IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcbi8vIFx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcbi8vIFx0XHRcdFx0XHRpZiAocmVzLmRhdGEpIHtcbi8vIFx0XHRcdFx0XHRcdHJldHVyblxuLy8gXHRcdFx0XHRcdH1cbi8vIFx0XHRcdFx0XHRlbHNlIHtcbi8vIFx0XHRcdFx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKVxuLy8gXHRcdFx0XHRcdH1cbi8vIFx0XHRcdFx0fSk7XG4vLyBcdFx0XHR9XG4vLyBcdFx0fVxuLy8gXHR9KTtcbi8vIH0pO1xuXG4vL2FkZCBGYWN0b3J5XG5hcHAuY29udHJvbGxlcignRmlsZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJG1vZGFsSW5zdGFuY2UsIHJlcG8sICRtZERpYWxvZykge1xuXG4gIHBvcHVwR2l0RmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24odXNlcikge1xuXHRcdCRzY29wZS51c2VyID0gdXNlci51c2VyO1xuXHRcdCRzY29wZS5kaXNwbGF5TmFtZSA9ICRzY29wZS51c2VyLmdpdGh1Yi5uYW1lO1xuXG5cdH0pXG5cblx0JHNjb3BlLnJlcG9OYW1lID0gcmVwby5uYW1lO1xuXG5cdC8vIGNvbnNvbGUubG9nKCdmcm9tIHRoZSBjb250cm9sbGVyIGlzIHRoZSByZXBvJywgcmVwbylcblxuXHRwb3B1cEdpdEZhY3RvcnkubGlzdEZpbGVzKHJlcG8pLnRoZW4oZnVuY3Rpb24ocmVwbyl7XG5cbiAgICAkc2NvcGUuZmlsZUNyZWF0ZWQgPSByZXBvLmZpbGVzWzBdLnRpbWVzdGFtcC5zbGljZSgwLDEwKTtcblx0XHRjb25zb2xlLmxvZygnbGlzdCBmaWxlcycsIHJlcG8pXG5cblx0XHRyZXBvLmZpbGVzLmZvckVhY2goZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0dmFyIHVybCA9IGZpbGUuZmlsZVVybC5zcGxpdCgnLycpO1xuXHRcdFx0ZmlsZS5kaXNwbGF5ID0gdXJsW3VybC5sZW5ndGgtMl0gKyAnLycgKyB1cmxbdXJsLmxlbmd0aC0xXTtcblxuICAgICAgLy9udW1iZXIgb2YgY29tbWVudHNcbiAgICAgICRzY29wZS5jb21tZW50ZXJzID0gW107XG4gICAgICAkc2NvcGUuZGlzcGxheUNvbW1lbnRlcnMgPSBcIlwiO1xuICAgICAgZmlsZS5udW1Db21tZW50cyA9IDA7XG4gICAgICBmaWxlLmhpZ2hsaWdodGVkLmZvckVhY2goZnVuY3Rpb24oaGlnaGxpZ2h0KSB7XG4gICAgICAgIGZpbGUubnVtQ29tbWVudHMgKz0gaGlnaGxpZ2h0LmNvbW1lbnQubGVuZ3RoXG4gICAgICAgIGhpZ2hsaWdodC5jb21tZW50LmZvckVhY2goZnVuY3Rpb24oY29tbWVudCkge1xuICAgICAgICAgIGlmICgkc2NvcGUuY29tbWVudGVycy5pbmRleE9mKGNvbW1lbnQuY29tbWVudGVyKSA9PT0gLTEpICRzY29wZS5jb21tZW50ZXJzLnB1c2goY29tbWVudC5jb21tZW50ZXIpO1xuICAgICAgICB9KVxuICAgICAgfSlcblx0XHR9KVxuXG4gICAgLy8gJHNjb3BlLmNvbW1lbnRlcnMuZm9yRWFjaChmdW5jdGlvbihjb21tbWVudGVyKSB7XG4gICAgLy9cbiAgICAvLyB9KVxuICAgICRzY29wZS5nZXRSYW5kb21Db2xvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gdmFyIGNvbG9ycyA9IHtcbiAgICAgIC8vICAgYXF1YTogXCIjMDMwMzAzXCIsXG4gICAgICAvLyAgIHJlZDogXCJyZWRcIlxuICAgICAgLy8gfVxuICAgICAgdmFyIGxldHRlcnMgPSAnMDEyMzQ1Njc4OUFCQ0RFRicuc3BsaXQoJycpO1xuICAgICAgdmFyIGNvbG9yID0gJyMnO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2OyBpKysgKSB7XG4gICAgICAgICAgY29sb3IgKz0gbGV0dGVyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNildO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbG9yO1xuICAgIH1cblxuXHRcdCRzY29wZS5maWxlc1VuZGVyUmVwbyA9IHJlcG8uZmlsZXM7XG5cdH0pXG5cblxuXHQvLyAkc2NvcGUuc2hvd1lvdXJGaWxlcyA9ICRzY29wZS51c2VyLnJlcG9zO1xuXG5cdCRzY29wZS5nb1RvRmlsZSA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRjaHJvbWUudGFicy5jcmVhdGUoe1xuICAgICAgICB1cmw6IGZpbGUuZmlsZVVybFxuICAgIH0pO1xuXHR9XG5cblx0JHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gIH1cblxuXG59KVxuXG5cblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL255ank4NS9jb2RlX3Jldmlldy9jb21taXQvNGUwZjdlYzMzNTM5ODA0MzE2ZGZmZjc4NmI4MGJlODZkZTY3MmVhNFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL255ank4NS9jb2RlX3Jldmlldy9ibG9iL3JpZ2h0Q2xpY2svYnJvd3Nlci9zY3NzL2hvbWUvbWFpbi5zY3NzXG5cbi8vIEJyYW5jaDogcmlnaHRDbGlja1xuLy8gUmVwbyBOYW1lOiBjb2RlX3Jldmlld1xuLy8gRmlsZXM6IC9icm93c2VyL3Njc3MvaG9tZS9tYWluLnNjc3NcbiIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhcmNoaXZlJywge1xuXHRcdHVybDogJy9hcmNoaXZlJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9hcmNoaXZlL2FyY2hpdmUuaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ0FyY2hpdmVDdHJsJyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRBdXRoZW50aWNhdGU6IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcblx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0XHRpZiAocmVzLmRhdGEpIHtcblx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn0pO1xuXG4vL2FkZCBGYWN0b3J5XG5hcHAuY29udHJvbGxlcignQXJjaGl2ZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJG1kRGlhbG9nKSB7XG5cbiAgcG9wdXBHaXRGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbih1c2VyKSB7XG5cdFx0JHNjb3BlLnVzZXIgPSB1c2VyLnVzZXI7XG4gICAgJHNjb3BlLnNob3dBcmNoID0gJHNjb3BlLnVzZXIuYXJjaGl2ZXM7XG5cdH0pXG5cblxuXG59KVxuIiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG5cdFx0dXJsOiAnL2hvbWUnLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2hvbWUvaG9tZS5odG1sJyxcblx0XHRjb250cm9sbGVyOiAnSG9tZUN0cmwnLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdEF1dGhlbnRpY2F0ZTogZnVuY3Rpb24oJGh0dHAsICRzdGF0ZSkge1xuXHRcdFx0XHQkaHR0cC5nZXQoXCJodHRwOi8vbG9jYWxob3N0OjEzMzcvc2Vzc2lvblwiKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRcdGlmIChyZXMuZGF0YSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0JHN0YXRlLmdvKCdsb2dpbicpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdIb21lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgcG9wdXBHaXRGYWN0b3J5LCAkdGltZW91dCwgJG1kU2lkZW5hdiwgJG1kVXRpbCwgJHRpbWVvdXQsICRxLCAkbG9nLCAkbW9kYWwsICRtZERpYWxvZykge1xuXG5cblx0JHNjb3BlLnJlcG9zTG9hZGVkID0gcG9wdXBHaXRGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbih1c2VyKSB7XG5cdFx0JHNjb3BlLnVzZXIgPSB1c2VyO1xuXHRcdCRzY29wZS50b2tlbk9iaiA9IHt0b2tlbjogJHNjb3BlLnVzZXIuZ2l0aHViLnRva2VufTtcblx0XHQkc2NvcGUuc2hvd1JlcG9zID0gJHNjb3BlLnVzZXIucmVwb3M7XG5cdFx0JHNjb3BlLm5vdGlOdW0gPSAkc2NvcGUudXNlci5ub3RpZmljYXRpb25zLmxlbmd0aDtcblx0XHRyZXR1cm4gJHNjb3BlLmxvYWRSZXBvcygpO1xuXHR9KVxuXG5cdCRzY29wZS5sb2FkUmVwb3MgPSBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHBvcHVwR2l0RmFjdG9yeS5nZXRSZXBvc1RvQWRkKCRzY29wZS50b2tlbk9iailcblx0XHQudGhlbihmdW5jdGlvbihyZXBvcykge1xuXHRcdFx0XHQkc2NvcGUucmVwb3NUb0FkZCA9IHJlcG9zO1xuXHRcdFx0XHRyZXR1cm4gcmVwb3M7XG5cdFx0fSlcblx0fVxuXG5cdCRzY29wZS5xdWVyeVNlYXJjaCA9IGZ1bmN0aW9uIChxdWVyeSkge1xuXG5cdFx0cmV0dXJuICRzY29wZS5yZXBvc0xvYWRlZC50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gcXVlcnkgPyAkc2NvcGUucmVwb3NUb0FkZC5maWx0ZXIoZmlsdGVyRm4pIDogJHNjb3BlLnJlcG9zVG9BZGQ7XG5cdFx0fSk7XG5cblx0XHRmdW5jdGlvbiBmaWx0ZXJGbihyZXBvKSB7XG5cdFx0XHRyZXR1cm4gKHJlcG8ubmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoYW5ndWxhci5sb3dlcmNhc2UocXVlcnkpKSA9PT0gMCk7XG5cdFx0fTtcblx0fVxuXG5cdCRzY29wZS50b2dnbGVBZGRCYXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0JHNjb3BlLnNob3dBZGRCYXIgPSAhJHNjb3BlLnNob3dBZGRCYXI7XG5cdH1cblxuXHQkc2NvcGUudG9nZ2xlTm90aWZpY2F0aW9uID0gZnVuY3Rpb24gKCkge1xuXHRcdCRzY29wZS5zaG93Tm90aWZpY2F0aW9uID0gISRzY29wZS5zaG93Tm90aWZpY2F0aW9uO1xuXHR9XG5cblx0JHNjb3BlLm5vdGlmaWNhdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0cG9wdXBHaXRGYWN0b3J5LmdldE5vdGlmaWNhdGlvbigkc2NvcGUudXNlcilcblx0XHQudGhlbihmdW5jdGlvbihub3RpZmljYXRpb25zKSB7XG5cblx0XHRcdG5vdGlmaWNhdGlvbnMubWFwKGZ1bmN0aW9uKG4pe1xuXHRcdFx0XHRjb25zb2xlLmxvZygnbm90aWZpY2F0aW9zbiEhISEhJylcblx0XHRcdFx0dmFyIGZpbGVVcmwgPSBuLmZpbGVVcmw7XG5cdFx0XHRcdHZhciB1cmwgPSBmaWxlVXJsLnNwbGl0KCcvJyk7XG5cdFx0XHRcdG4ucmVwb05hbWUgPSB1cmxbNF07XG5cdFx0XHRcdG4uZmlsZSA9IHVybFt1cmwubGVuZ3RoLTJdICsgJy8nICsgdXJsW3VybC5sZW5ndGgtMV07XG5cdFx0XHRcdG4udGltZXN0YW1wID0gTWF0aC5mbG9vcigoRGF0ZS5ub3coKSAtIERhdGUucGFyc2Uobi50aW1lc3RhbXApKS8xMDAwLzYwKSArICdtaW4gYWdvJztcblx0XHRcdFx0aWYobi5saW5lKSBuLmxpbmUgPSBuLmxpbmUuc2xpY2UoMik7XG5cblx0XHRcdFx0dmFyIG1lc3NhZ2UgPSBbXG5cdFx0XHRcdFx0e3VwZGF0ZTogJ25ld0hpZ2hsaWdodCcsIGRpc3BsYXk6ICcgYWRkZWQgJyArIG4ubnVtYmVyICsgJyBuZXcgY29tbWVudHMgb24gJysgbi5yZXBvTmFtZSArIFwiKFwiICsgbi5maWxlICsgXCIpICAgICAgXCJ9LFxuXHRcdFx0XHRcdHt1cGRhdGU6ICduZXdDb21tZW50JywgZGlzcGxheTogJyBhZGRlZCAnKyBuLm51bWJlciArICcgcmVzcG9uc2VzIG9uICcgKyBuLnJlcG9OYW1lICsgXCIoXCIgKyBuLmZpbGUgK1wiKVwiKycgb24gbGluZSAnKyBuLmxpbmUgKyBcIiAgICBcIn1cblx0XHRcdFx0XVxuXG5cdFx0XHRcdG1lc3NhZ2UuZm9yRWFjaChmdW5jdGlvbihtc2cpIHtcblx0XHRcdFx0XHRpZiAobi51cGRhdGUgPT09IG1zZy51cGRhdGUpIHtcblx0XHRcdFx0XHRcdG4uZGlzcGxheSA9IG1zZy5kaXNwbGF5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdH0pXG5cblx0XHRcdCRzY29wZS5ub3RpID0gbm90aWZpY2F0aW9ucztcblx0XHR9KVxuXG5cdH1cblxuXHQkc2NvcGUub3BlbkZpbGUgPSBmdW5jdGlvbih1cmwpIHtcblx0XHRjaHJvbWUudGFicy5jcmVhdGUoe1xuICAgICAgICB1cmw6IHVybFxuICAgIH0pO1xuXHR9XG5cblx0dmFyIGNhbm5vdEFkZEJveCA9IGZ1bmN0aW9uICgpIHtcblx0XHQkbWREaWFsb2cuc2hvdyhcblx0XHQkbWREaWFsb2cuYWxlcnQoKVxuXHRcdFx0LnBhcmVudChhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkpXG5cdFx0XHQudGl0bGUoJ1VuZm9ydHVuYXRlbHknKVxuXHRcdFx0LmNvbnRlbnQoJ1lvdSBjYW5ub3QgYWRkIGEgcmVwbyB5b3UgYWxyZWFkeSBhZGRlZC4nKVxuXHRcdFx0Lm9rKCdHb3QgaXQhJylcblx0XHQpO1xuXHR9XG5cblx0JHNjb3BlLmFkZFJlcG8gPSBmdW5jdGlvbiAocmVwbykge1xuXHRcdFx0JHNjb3BlLnJlcG9TZWxlY3RlZCA9IG51bGw7XG5cblx0XHRcdHBvcHVwR2l0RmFjdG9yeS5nZXRDb250cmlidXRvcnMocmVwby5jb250cmlidXRvcnNfdXJsKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24obmFtZXMpIHtcblx0XHRcdFx0cmVwby5jb250cmlidXRvcnMgPSBuYW1lcztcblxuXHRcdFx0XHR2YXIgc2F2ZXJlcG8gPSB7bmFtZTogcmVwby5uYW1lLCB1cmw6IHJlcG8uaHRtbF91cmwsIGNvbnRyaWJ1dG9yczogcmVwby5jb250cmlidXRvcnN9XG5cblx0XHRcdFx0Ly9jcmVhdGUgUmVwbyBpZiBpdCBkb2Vzbid0IGV4aXN0IGluIHRoZSBSZXBvLmRiICsgYWRkIHJlcG8gdG8gVXNlci5kYlxuXHRcdFx0XHRwb3B1cEdpdEZhY3RvcnkucmVwb0ZpbmRPckluc2VydChzYXZlcmVwbykudGhlbihmdW5jdGlvbihyZXNEYXRhKSB7XG5cdFx0XHRcdFx0aWYoIXJlc0RhdGEudXNlckFscmVhZHlIYWQpIHtcblx0XHRcdFx0XHRcdCRzY29wZS51c2VyLnJlcG9zLnB1c2gocmVzRGF0YS5yZXBvKTtcblx0XHRcdFx0XHRcdGNocm9tZVJlZnJlc2goKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBjYW5ub3RBZGRCb3goKTtcblxuXHRcdFx0XHR9KVxuXHRcdFx0fSlcblxuXHR9XG5cblx0JHNjb3BlLmRlbGV0ZVJlcG8gPSBmdW5jdGlvbihyZXBvKSB7XG5cdFx0Y29uc29sZS5sb2coJ2RlbGV0aW5nIHJlcG8nKVxuXG5cdFx0dmFyIGNvbmZpcm0gPSAkbWREaWFsb2cuY29uZmlybSgpXG4gICAgICAucGFyZW50KGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KSlcbiAgICAgIC50aXRsZSgnQ29uZmlybScpXG4gICAgICAuY29udGVudCgnV291bGQgeW91IGxpa2UgdG8gZGVsZXRlIHRoaXMgcmVwbz8nKVxuICAgICAgLm9rKCdZZXMhJylcbiAgICAgIC5jYW5jZWwoJ05vIScpO1xuXG5cdFx0JG1kRGlhbG9nLnNob3coY29uZmlybSkudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdC8vYWZ0ZXIgY29uZmlybSBkZWxldGVcblx0XHRcdGNvbnNvbGUubG9nKCd1c2VycyByZXBvJywgJHNjb3BlLnVzZXIucmVwb3MpXG5cdFx0XHQkc2NvcGUudXNlci5yZXBvcy5mb3JFYWNoKGZ1bmN0aW9uKHVzZXJyZXBvLCBpKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCd1c2VycmVwbyBpbiBkZWxldGVyZXBvISEhJywgdXNlcnJlcG8sIHJlcG8pXG5cdFx0XHRcdGlmICh1c2VycmVwby5faWQgPT09IHJlcG8uX2lkKSAkc2NvcGUudXNlci5yZXBvcy5zcGxpY2UoaSwxKTtcblx0XHRcdH0pXG5cdFx0XHRwb3B1cEdpdEZhY3RvcnkuZWRpdFJlcG8oJHNjb3BlLnVzZXIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdGNocm9tZVJlZnJlc2goKTtcblx0XHRcdH0pXG5cbiAgICB9KTtcblxuXHR9XG5cblx0JHNjb3BlLmdvQXJjaGl2ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdCRzdGF0ZS5nbygnYXJjaGl2ZScpO1xuXHR9XG5cblx0JHNjb3BlLmFyY2hpdmVSZXBvID0gZnVuY3Rpb24ocmVwbykge1xuXHRcdHZhciBjb25maXJtID0gJG1kRGlhbG9nLmNvbmZpcm0oKVxuICAgICAgLnBhcmVudChhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkpXG4gICAgICAudGl0bGUoJ0NvbmZpcm0nKVxuICAgICAgLmNvbnRlbnQoJ1dvdWxkIHlvdSBsaWtlIHRvIGFyY2hpdmUgdGhpcyByZXBvPycpXG4gICAgICAub2soJ1llcyEnKVxuICAgICAgLmNhbmNlbCgnTm8hJyk7XG5cblx0XHQkbWREaWFsb2cuc2hvdyhjb25maXJtKS50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly9hZnRlciBjb25maXJtIHRvIGFyY2hpdmVcblx0XHRcdC8vYWRkIHJlcG8gdG8gdXNlci5hcmNoaXZlc1xuXHRcdFx0JHNjb3BlLnVzZXIuYXJjaGl2ZXMucHVzaChyZXBvKTtcblx0XHRcdGNvbnNvbGUubG9nKCRzY29wZS51c2VyLmFyY2hpdmVzKTtcblx0XHRcdHBvcHVwR2l0RmFjdG9yeS5hcmNoaXZlUmVwbygkc2NvcGUudXNlcikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ2FyY2hpdmVkIHRvIGRiJywgcmVzKVxuXHRcdFx0fSlcblxuXHRcdFx0Ly9kZWxldGUgcmVwbyBmcm9tIHVzZXIucmVwb3Ncblx0XHRcdCRzY29wZS51c2VyLnJlcG9zLmZvckVhY2goZnVuY3Rpb24odXNlcnJlcG8sIGkpIHtcblx0XHRcdFx0aWYgKHVzZXJyZXBvLl9pZCA9PT0gcmVwby5faWQpICRzY29wZS51c2VyLnJlcG9zLnNwbGljZShpLDEpO1xuXHRcdFx0fSlcblx0XHRcdHBvcHVwR2l0RmFjdG9yeS5lZGl0UmVwbygkc2NvcGUudXNlcikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ2RlbGV0ZWQgcmVwbycsIHJlcylcblx0XHRcdH0pXG5cbiAgICB9KTtcblxuXHR9XG5cblx0JHNjb3BlLmdvVG9SZXBvID0gZnVuY3Rpb24ocmVwbykge1xuXHRcdGNocm9tZS50YWJzLmNyZWF0ZSh7XG4gICAgICAgIHVybDogcmVwby51cmxcbiAgICB9KTtcblx0fVxuXG5cdC8vbGlzdCBmaWxlcyB1bmRlciBhIHJlcG9cblx0JHNjb3BlLmxpc3RGaWxlcyA9IGZ1bmN0aW9uKHJlcG8pIHtcblx0XHR2YXIgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2ZpbGVzL2ZpbGUuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnRmlsZUN0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICByZXBvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gcmVwbztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXHR9XG5cblx0Ly9sb2cgb3V0XG5cdCRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0cG9wdXBHaXRGYWN0b3J5LmxvZ291dCgpLnRoZW4oZnVuY3Rpb24ocmVzKXtcblx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKTtcblx0XHRcdC8vIGNocm9tZS50YWJzLnF1ZXJ5KHt0aXRsZTogJ0hpZ2hsaWdodCBZb3VyIFdvcmxkJ30sIGZ1bmN0aW9uKHRhYnMpe1xuICAgLy8gICAgICAgIFx0XHR0YWJzLmZvckVhY2goZnVuY3Rpb24odGFiKXtcbiAgIC8vICAgICAgICAgIFx0Y2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCBtZXNzYWdlOiAnbG9nb3V0Jyk7XG4gICAvLyAgICAgICAgICBcdH0pXG4gICAvLyAgICAgICAgXHR9KTtcblx0XHR9KVxuXHR9XG5cblx0Ly9zaWRlYmFyXG5cdCRzY29wZS50b2dnbGVMZWZ0ID0gYnVpbGRUb2dnbGVyKCdsZWZ0Jyk7XG5cblx0ZnVuY3Rpb24gYnVpbGRUb2dnbGVyKG5hdklEKSB7XG4gICAgICB2YXIgZGVib3VuY2VGbiA9ICAkbWRVdGlsLmRlYm91bmNlKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkbWRTaWRlbmF2KG5hdklEKVxuICAgICAgICAgICAgICAudG9nZ2xlKClcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICRsb2cuZGVidWcoXCJ0b2dnbGUgXCIgKyBuYXZJRCArIFwiIGlzIGRvbmVcIik7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sMzAwKTtcbiAgICAgIHJldHVybiBkZWJvdW5jZUZuO1xuICB9XG5cblx0JHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgJG1kU2lkZW5hdignbGVmdCcpLmNsb3NlKClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRsb2cuZGVidWcoXCJjbG9zZSBMRUZUIGlzIGRvbmVcIik7XG4gICAgICAgIH0pO1xuICBcdH07XG5cbiAgXHRmdW5jdGlvbiBjaHJvbWVSZWZyZXNoICgpIHtcbiAgXHRcdGNocm9tZS50YWJzLnF1ZXJ5KHt0aXRsZTogJ0hpZ2hsaWdodCBZb3VyIFdvcmxkJ30sIGZ1bmN0aW9uKHRhYnMpe1xuXHRcdHRhYnMuZm9yRWFjaChmdW5jdGlvbih0YWIpe1xuXHRcdFx0Y2hyb21lLnRhYnMucmVsb2FkKHRhYi5pZCk7XG5cdFx0XHR9KVxuXHRcdH0pXG4gIFx0fTtcblxufSlcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcblx0XHR1cmw6ICcvJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9sb2dpbi9sb2dpbi5odG1sJyxcblx0XHRjb250cm9sbGVyOiAnTG9naW5Db250cm9sbGVyJyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRMb2dpbjogZnVuY3Rpb24oJGh0dHAsICRzdGF0ZSkge1xuXHRcdFx0XHQkaHR0cC5nZXQoXCJodHRwOi8vbG9jYWxob3N0OjEzMzcvc2Vzc2lvblwiKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRcdGlmKHJlcy5kYXRhKSB7XG5cdFx0XHRcdFx0XHQkc3RhdGUuZ28oJ2hvbWUnKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignTG9naW5Db250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSl7XG4gICRzY29wZS5tZXNzYWdlID0gXCJDaGVjayB0aGlzIHBhZ2Ugb3V0IG5vdyFcIjtcblxuXHQvLyAkc2NvcGUubG9nZ2VkaW4gPSBmYWxzZTtcblxuXHQkc2NvcGUuZ2l0TG9naW4gPSBmdW5jdGlvbigpIHtcblx0XHQvL25lZWQgdG8gY2hhbmdlIGxvY2FsaG9zdDoxMzM3IHRvIHRoZSBhcHByb3ByaWF0ZSBkb21haW4gbmFtZSBhZnRlciBkZXBsb3ltZW50ISEhXG5cdFx0Y29uc29sZS5sb2coJ2dpdExvZ2luJylcblx0XHQkc2NvcGUuU3VjY2Vzc2Z1bExvZ2luKCk7XG5cdFx0Y2hyb21lLnRhYnMuY3JlYXRlKHtcbiAgICAgICAgdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9hdXRoL2dpdGh1YlwiXG4gICAgfSk7XG5cblx0fVxuXG5cblx0Ly8gY29uc29sZS5sb2coc2Vzc2lvbilcblxuXG5cdCRzY29wZS5TdWNjZXNzZnVsTG9naW4gPSBmdW5jdGlvbigpIHtcblx0XHRjb25zb2xlLmxvZygnc3VjY2Vzc3VmbGx5IGxvZ2dpbicpXG5cblx0XHQkc3RhdGUuZ28oJ2hvbWUnKVxuXHRcdGdldE5hbWUoKTtcblx0XHQvLyAkc2NvcGUubG9nZ2VkaW4gPSB0cnVlO1xuXHR9XG5cblx0dmFyIGdldE5hbWUgPSBmdW5jdGlvbigpIHtcblx0XHRwb3B1cEdpdEZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdnZXROYW1lJywgZGF0YSk7XG5cdFx0XHQvLyAkc2NvcGUubmFtZSA9XG5cdFx0fSlcblx0fVxufSlcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==