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



//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZhY3Rvcmllcy9wb3B1cEdpdEZhY3RvcnkuanMiLCJkaXJlY3RpdmVzL3NldHRpbmdCdXR0b24vc2V0dGluZ0J1dHRvbi5qcyIsImRpcmVjdGl2ZXMvc2lkZWJhci9zaWRlYmFyLmpzIiwic3RhdGVzL2ZpbGVzL2ZpbGUuanMiLCJzdGF0ZXMvYXJjaGl2ZS9hcmNoaXZlLmpzIiwic3RhdGVzL2hvbWUvaG9tZS5qcyIsInN0YXRlcy9sb2dpbi9sb2dpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakZBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdDb2RlUmV2aWV3RXh0JywgWyd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nTWF0ZXJpYWwnXSk7XG5cblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJG1kSWNvblByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHJlcXVpcmVCYXNlOiBmYWxzZVxuICAgIH0pO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcblxuICAgICRtZEljb25Qcm92aWRlclxuICAgIC5pY29uU2V0KFwiY2FsbFwiLCAnaW1nL2ljb25zL2NvbW11bmljYXRpb24taWNvbnMuc3ZnJywgMjQpXG4gICAgLmljb25TZXQoXCJzb2NpYWxcIiwgJ2ltZy9pY29ucy9zb2NpYWwtaWNvbnMuc3ZnJywgMjQpO1xuXG5cbiAgICAvLyB3aGl0ZWxpc3QgdGhlIGNocm9tZS1leHRlbnNpb246IHByb3RvY29sXG4gICAgLy8gc28gdGhhdCBpdCBkb2VzIG5vdCBhZGQgXCJ1bnNhZmU6XCJcbiAgICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3xjaHJvbWUtZXh0ZW5zaW9uKTovKTtcbiAgICAkY29tcGlsZVByb3ZpZGVyLmltZ1NyY1Nhbml0aXphdGlvbldoaXRlbGlzdCgvXlxccyooaHR0cHM/fGZ0cHxmaWxlfGxvY2FsfGNocm9tZS1leHRlbnNpb24pOnxkYXRhOmltYWdlXFwvLyk7XG5cbn0pO1xuXG5cbiIsImFwcC5mYWN0b3J5KCdwb3B1cEdpdEZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCkge1xuICAgIHZhciBkb21haW4gPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MTMzN1wiO1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICBnZXRVc2VySW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9zZXNzaW9uXCIpLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YS51c2VyO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFJlcG9zVG9BZGQ6IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2hpdCBnZXRyZXBvJywgdG9rZW4pXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9hcGkvZ2l0XCIsIHtwYXJhbXM6IHRva2VufSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldENvbnRyaWJ1dG9yczogZnVuY3Rpb24oY29udHJpYnV0b3JVcmwpIHtcbiAgICAgICAgICB2YXIgaSA9IGNvbnRyaWJ1dG9yVXJsLm1hdGNoKC9yZXBvcy8pLmluZGV4ICsgNjtcbiAgICAgICAgICB2YXIgcmVwb1VybCA9IGNvbnRyaWJ1dG9yVXJsLnNsaWNlKGksIC0xMyk7XG4gICAgICAgICAgdmFyIG93bmVyID0gcmVwb1VybC5zcGxpdCgnLycpWzBdO1xuICAgICAgICAgIHZhciByZXBvID0gcmVwb1VybC5zcGxpdCgnLycpWzFdO1xuXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9hcGkvZ2l0L3JlcG9zL1wiICsgb3duZXIgKyAnLycgKyByZXBvICsgJy9jb250cmlidXRvcnMnKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgLy9kZWxldGluZyByZXBvIGZyb20gcHJvZmlsZVxuICAgICAgICBlZGl0UmVwbzogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdhZGRSZXBvVG9Qcm9maWxlIGZhY3RvcnknLHVzZXIucmVwb3MpXG4gICAgICAgICAgdmFyIHJlcG8gPSB7cmVwbzogdXNlci5yZXBvc31cbiAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KGRvbWFpbiArIFwiL2FwaS91c2Vycy9cIiArIHVzZXIuZ2l0aHViLnVzZXJuYW1lICsgXCIvZWRpdFJlcG9cIiwgcmVwbylcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGFyY2hpdmVSZXBvOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2FyY2hpZXZlIHJlcG8gZmFjdG9yeScsIHVzZXIuYXJjaGl2ZXMpO1xuICAgICAgICAgIHZhciBhcmNoaXZlcyA9IHtyZXBvOiB1c2VyLmFyY2hpdmVzfVxuICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoZG9tYWluICsgJy9hcGkvdXNlcnMvJyArIHVzZXIuZ2l0aHViLnVzZXJuYW1lICsgJy9hcmNoaXZlUmVwbycsIGFyY2hpdmVzKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgbGlzdEZpbGVzOiBmdW5jdGlvbihyZXBvKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2xpc3QgZmlsZSBuYW1lcyB1bmRlciB0aGUgcmVwbycsIHJlcG8pXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9hcGkvcmVwby9hbGxcIiwge3BhcmFtczogcmVwb30pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICByZXBvRmluZE9ySW5zZXJ0OiBmdW5jdGlvbihyZXBvKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2lzIHRoZXJlIHN1Y2ggcmVwbz8gZmFjdG9yeScsIHJlcG8pXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9hcGkvcmVwby9cIiwge3BhcmFtczogcmVwb30pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldE5vdGlmaWNhdGlvbjogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgJy9hcGkvdXNlcnMvJyArIHVzZXIuZ2l0aHViLnVzZXJuYW1lICsgJy9ub3RpZmljYXRpb25zJylcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGxvZ291dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2hpdHRpbmcgdGhlIGZhY3RvcnknKVxuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgXHRcdFx0IHJldHVybiBcIkxvZ2dlZCBPdXRcIjtcbiAgICBcdFx0fSk7XG4gICAgICB9XG4gICAgfVxufSk7XG4iLCIiLCIvLyAndXNlIHN0cmljdCc7XG4vLyBhcHAuZGlyZWN0aXZlKCdzaWRlYmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzdGF0ZSwgcG9wdXBHaXRGYWN0b3J5LCAkdGltZW91dCwgJG1kU2lkZW5hdiwgJGxvZykge1xuLy9cbi8vICAgICByZXR1cm4ge1xuLy8gICAgICAgICByZXN0cmljdDogJ0UnLFxuLy8gICAgICAgICBzY29wZToge30sXG4vLyAgICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvc2lkZWJhci9zaWRlYmFyLmh0bWwnLFxuLy8gICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcbi8vXG4vLyAgICAgICAgICAgc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAgICAgJG1kU2lkZW5hdigncmlnaHQnKS5jbG9zZSgpXG4vLyAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAgICAgICAgICRsb2cuZGVidWcoXCJjbG9zZSBMRUZUIGlzIGRvbmVcIik7XG4vLyAgICAgICAgICAgICB9KTtcbi8vICAgICAgICAgICB9O1xuLy9cbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vXG4vLyAgIH1cbi8vIH0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLy8gYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbi8vIFx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2ZpbGUnLCB7XG4vLyBcdFx0dXJsOiAnL2ZpbGUnLFxuLy8gXHRcdHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2ZpbGVzL2ZpbGUuaHRtbCcsXG4vLyBcdFx0Y29udHJvbGxlcjogJ0ZpbGVDdHJsJyxcbi8vIFx0XHRyZXNvbHZlOiB7XG4vLyBcdFx0XHRBdXRoZW50aWNhdGU6IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcbi8vIFx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcbi8vIFx0XHRcdFx0XHRpZiAocmVzLmRhdGEpIHtcbi8vIFx0XHRcdFx0XHRcdHJldHVyblxuLy8gXHRcdFx0XHRcdH1cbi8vIFx0XHRcdFx0XHRlbHNlIHtcbi8vIFx0XHRcdFx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKVxuLy8gXHRcdFx0XHRcdH1cbi8vIFx0XHRcdFx0fSk7XG4vLyBcdFx0XHR9XG4vLyBcdFx0fVxuLy8gXHR9KTtcbi8vIH0pO1xuXG4vL2FkZCBGYWN0b3J5XG5hcHAuY29udHJvbGxlcignRmlsZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJG1vZGFsSW5zdGFuY2UsIHJlcG8sICRtZERpYWxvZykge1xuXG4gIHBvcHVwR2l0RmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24odXNlcikge1xuXHRcdCRzY29wZS51c2VyID0gdXNlci51c2VyO1xuXHRcdCRzY29wZS5kaXNwbGF5TmFtZSA9ICRzY29wZS51c2VyLmdpdGh1Yi5uYW1lO1xuXG5cdH0pXG5cblx0JHNjb3BlLnJlcG9OYW1lID0gcmVwby5uYW1lO1xuXHRjb25zb2xlLmxvZygnZnJvbSB0aGUgY29udHJvbGxlciBpcyB0aGUgcmVwbycsIHJlcG8pXG5cblx0cG9wdXBHaXRGYWN0b3J5Lmxpc3RGaWxlcyhyZXBvKS50aGVuKGZ1bmN0aW9uKHJlcG8pe1xuXG5cdFx0Y29uc29sZS5sb2coJ2xpc3QgZmlsZXMnLCByZXBvKVxuXG5cdFx0cmVwby5maWxlcy5mb3JFYWNoKGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdHZhciB1cmwgPSBmaWxlLmZpbGVVcmw7XG5cdFx0XHR2YXIgaSA9IHVybC5tYXRjaCgvYmxvYi8pLmluZGV4ICsgNTtcblx0XHRcdGZpbGUuZGlzcGxheSA9IHVybC5zbGljZShpKTtcblx0XHR9KVxuXHRcdCRzY29wZS5maWxlc1VuZGVyUmVwbyA9IHJlcG8uZmlsZXM7XG5cdH0pXG5cblxuXHQvLyAkc2NvcGUuc2hvd1lvdXJGaWxlcyA9ICRzY29wZS51c2VyLnJlcG9zO1xuXG5cdCRzY29wZS5nb1RvRmlsZSA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRjaHJvbWUudGFicy5jcmVhdGUoe1xuICAgICAgICB1cmw6IGZpbGUuZmlsZVVybFxuICAgIH0pO1xuXHR9XG5cblx0JHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gIH1cblxuXG59KVxuXG5cblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL255ank4NS9jb2RlX3Jldmlldy9jb21taXQvNGUwZjdlYzMzNTM5ODA0MzE2ZGZmZjc4NmI4MGJlODZkZTY3MmVhNFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL255ank4NS9jb2RlX3Jldmlldy9ibG9iL3JpZ2h0Q2xpY2svYnJvd3Nlci9zY3NzL2hvbWUvbWFpbi5zY3NzXG5cbi8vIEJyYW5jaDogcmlnaHRDbGlja1xuLy8gUmVwbyBOYW1lOiBjb2RlX3Jldmlld1xuLy8gRmlsZXM6IC9icm93c2VyL3Njc3MvaG9tZS9tYWluLnNjc3NcbiIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhcmNoaXZlJywge1xuXHRcdHVybDogJy9hcmNoaXZlJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9hcmNoaXZlL2FyY2hpdmUuaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ0FyY2hpdmVDdHJsJyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRBdXRoZW50aWNhdGU6IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcblx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0XHRpZiAocmVzLmRhdGEpIHtcblx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn0pO1xuXG4vL2FkZCBGYWN0b3J5XG5hcHAuY29udHJvbGxlcignQXJjaGl2ZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJG1kRGlhbG9nKSB7XG5cbiAgcG9wdXBHaXRGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbih1c2VyKSB7XG5cdFx0JHNjb3BlLnVzZXIgPSB1c2VyLnVzZXI7XG4gICAgJHNjb3BlLnNob3dBcmNoID0gJHNjb3BlLnVzZXIuYXJjaGl2ZXM7XG5cdH0pXG5cblxuXG59KVxuIiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG5cdFx0dXJsOiAnL2hvbWUnLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2hvbWUvaG9tZS5odG1sJyxcblx0XHRjb250cm9sbGVyOiAnSG9tZUN0cmwnLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdEF1dGhlbnRpY2F0ZTogZnVuY3Rpb24oJGh0dHAsICRzdGF0ZSkge1xuXHRcdFx0XHQkaHR0cC5nZXQoXCJodHRwOi8vbG9jYWxob3N0OjEzMzcvc2Vzc2lvblwiKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRcdGlmIChyZXMuZGF0YSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0JHN0YXRlLmdvKCdsb2dpbicpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdIb21lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgcG9wdXBHaXRGYWN0b3J5LCAkdGltZW91dCwgJG1kU2lkZW5hdiwgJG1kVXRpbCwgJHRpbWVvdXQsICRxLCAkbG9nLCAkbW9kYWwsICRtZERpYWxvZykge1xuXHRcblxuICAkc2NvcGUucmVwb3NMb2FkZWQgPSBwb3B1cEdpdEZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcblx0XHQkc2NvcGUudXNlciA9IHVzZXI7XG5cdFx0JHNjb3BlLnRva2VuT2JqID0ge3Rva2VuOiAkc2NvcGUudXNlci5naXRodWIudG9rZW59O1xuXHRcdCRzY29wZS5zaG93UmVwb3MgPSAkc2NvcGUudXNlci5yZXBvcztcblx0XHQkc2NvcGUubm90aU51bSA9ICRzY29wZS51c2VyLm5vdGlmaWNhdGlvbnMubGVuZ3RoO1xuXHRcdHJldHVybiAkc2NvcGUubG9hZFJlcG9zKCk7XG5cdH0pXG5cblx0JHNjb3BlLmxvYWRSZXBvcyA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gcG9wdXBHaXRGYWN0b3J5LmdldFJlcG9zVG9BZGQoJHNjb3BlLnRva2VuT2JqKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlcG9zKSB7XG5cdFx0XHRcdCRzY29wZS5yZXBvc1RvQWRkID0gcmVwb3M7XG5cdFx0XHRcdHJldHVybiByZXBvcztcblx0XHR9KVxuXHR9XG5cblx0JHNjb3BlLnF1ZXJ5U2VhcmNoID0gZnVuY3Rpb24gKHF1ZXJ5KSB7XG5cblx0XHRyZXR1cm4gJHNjb3BlLnJlcG9zTG9hZGVkLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiBxdWVyeSA/ICRzY29wZS5yZXBvc1RvQWRkLmZpbHRlcihmaWx0ZXJGbikgOiAkc2NvcGUucmVwb3NUb0FkZDtcblx0XHR9KTtcblxuXHRcdGZ1bmN0aW9uIGZpbHRlckZuKHJlcG8pIHtcblx0XHRcdHJldHVybiAocmVwby5uYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihhbmd1bGFyLmxvd2VyY2FzZShxdWVyeSkpID09PSAwKTtcblx0XHR9O1xuXHR9XG5cblx0JHNjb3BlLnRvZ2dsZUFkZEJhciA9IGZ1bmN0aW9uICgpIHtcblx0XHQkc2NvcGUuc2hvd0FkZEJhciA9ICEkc2NvcGUuc2hvd0FkZEJhcjtcblx0fVxuXG5cdCRzY29wZS50b2dnbGVOb3RpZmljYXRpb24gPSBmdW5jdGlvbiAoKSB7XG5cdFx0JHNjb3BlLm5vdGlmaWNhdGlvbnMoKTtcblx0XHQkc2NvcGUuc2hvd05vdGlmaWNhdGlvbiA9ICEkc2NvcGUuc2hvd05vdGlmaWNhdGlvbjtcblx0fVxuXG5cdCRzY29wZS5ub3RpZmljYXRpb25zID0gZnVuY3Rpb24gKCkge1xuXHRcdHBvcHVwR2l0RmFjdG9yeS5nZXROb3RpZmljYXRpb24oJHNjb3BlLnVzZXIpXG5cdFx0LnRoZW4oZnVuY3Rpb24obm90aWZpY2F0aW9ucykge1xuXHRcdFx0Y29uc29sZS5sb2coJ25vdGlmaWNhdGlvc24hISEhIScsbm90aWZpY2F0aW9ucylcblx0XHRcdG5vdGlmaWNhdGlvbnMubWFwKGZ1bmN0aW9uKG5vdGlmaWNhdGlvbil7XG5cdFx0XHRcdC8vIG5vdGlmaWNhdGlvbi5maWxlVXJsLlxuXHRcdFx0XHQvLyBub3RpZmljYXRpb24ucmVwb05hbWUgPVxuXHRcdFx0XHQvLyBub3RpZmljYXRpb24uZmlsZSA9XG5cdFx0XHR9KVxuXHRcdFx0JHNjb3BlLm5vdGlmaWNhdGlvbnMgPSBub3RpZmljYXRpb25zO1xuXHRcdH0pXG5cdH1cblxuXHR2YXIgY2Fubm90QWRkQm94ID0gZnVuY3Rpb24gKCkge1xuXHRcdCRtZERpYWxvZy5zaG93KFxuXHRcdCRtZERpYWxvZy5hbGVydCgpXG5cdFx0XHQucGFyZW50KGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KSlcblx0XHRcdC50aXRsZSgnVW5mb3J0dW5hdGVseScpXG5cdFx0XHQuY29udGVudCgnWW91IGNhbm5vdCBhZGQgYSByZXBvIHlvdSBhbHJlYWR5IGFkZGVkLicpXG5cdFx0XHQub2soJ0dvdCBpdCEnKVxuXHRcdCk7XG5cdH1cblxuXHQkc2NvcGUuYWRkUmVwbyA9IGZ1bmN0aW9uIChyZXBvKSB7XG5cdFx0XHQkc2NvcGUucmVwb1NlbGVjdGVkID0gbnVsbDtcblxuXHRcdFx0cG9wdXBHaXRGYWN0b3J5LmdldENvbnRyaWJ1dG9ycyhyZXBvLmNvbnRyaWJ1dG9yc191cmwpXG5cdFx0XHQudGhlbihmdW5jdGlvbihuYW1lcykge1xuXHRcdFx0XHRyZXBvLmNvbnRyaWJ1dG9ycyA9IG5hbWVzO1xuXG5cdFx0XHRcdHZhciBzYXZlcmVwbyA9IHtuYW1lOiByZXBvLm5hbWUsIHVybDogcmVwby5odG1sX3VybCwgY29udHJpYnV0b3JzOiByZXBvLmNvbnRyaWJ1dG9yc31cblxuXHRcdFx0XHQvL2NyZWF0ZSBSZXBvIGlmIGl0IGRvZXNuJ3QgZXhpc3QgaW4gdGhlIFJlcG8uZGIgKyBhZGQgcmVwbyB0byBVc2VyLmRiXG5cdFx0XHRcdHBvcHVwR2l0RmFjdG9yeS5yZXBvRmluZE9ySW5zZXJ0KHNhdmVyZXBvKS50aGVuKGZ1bmN0aW9uKHJlc0RhdGEpIHtcblx0XHRcdFx0XHRpZighcmVzRGF0YS51c2VyQWxyZWFkeUhhZCkge1xuXHRcdFx0XHRcdFx0JHNjb3BlLnVzZXIucmVwb3MucHVzaChyZXNEYXRhLnJlcG8pO1xuXHRcdFx0XHRcdFx0Y2hyb21lUmVmcmVzaCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGNhbm5vdEFkZEJveCgpO1xuXG5cdFx0XHRcdH0pXG5cdFx0XHR9KVxuXG5cdH1cblxuXHQkc2NvcGUuZGVsZXRlUmVwbyA9IGZ1bmN0aW9uKHJlcG8pIHtcblx0XHRjb25zb2xlLmxvZygnZGVsZXRpbmcgcmVwbycpXG5cblx0XHR2YXIgY29uZmlybSA9ICRtZERpYWxvZy5jb25maXJtKClcbiAgICAgIC5wYXJlbnQoYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpKVxuICAgICAgLnRpdGxlKCdDb25maXJtJylcbiAgICAgIC5jb250ZW50KCdXb3VsZCB5b3UgbGlrZSB0byBkZWxldGUgdGhpcyByZXBvPycpXG4gICAgICAub2soJ1llcyEnKVxuICAgICAgLmNhbmNlbCgnTm8hJyk7XG5cblx0XHQkbWREaWFsb2cuc2hvdyhjb25maXJtKS50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly9hZnRlciBjb25maXJtIGRlbGV0ZVxuXHRcdFx0Y29uc29sZS5sb2coJ3VzZXJzIHJlcG8nLCAkc2NvcGUudXNlci5yZXBvcylcblx0XHRcdCRzY29wZS51c2VyLnJlcG9zLmZvckVhY2goZnVuY3Rpb24odXNlcnJlcG8sIGkpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ3VzZXJyZXBvIGluIGRlbGV0ZXJlcG8hISEnLCB1c2VycmVwbywgcmVwbylcblx0XHRcdFx0aWYgKHVzZXJyZXBvLl9pZCA9PT0gcmVwby5faWQpICRzY29wZS51c2VyLnJlcG9zLnNwbGljZShpLDEpO1xuXHRcdFx0fSlcblx0XHRcdHBvcHVwR2l0RmFjdG9yeS5lZGl0UmVwbygkc2NvcGUudXNlcikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0Y2hyb21lUmVmcmVzaCgpO1xuXHRcdFx0fSlcblxuICAgIH0pO1xuXG5cdH1cblxuXHQkc2NvcGUuZ29BcmNoaXZlID0gZnVuY3Rpb24oKSB7XG5cdFx0JHN0YXRlLmdvKCdhcmNoaXZlJyk7XG5cdH1cblxuXHQkc2NvcGUuYXJjaGl2ZVJlcG8gPSBmdW5jdGlvbihyZXBvKSB7XG5cdFx0dmFyIGNvbmZpcm0gPSAkbWREaWFsb2cuY29uZmlybSgpXG4gICAgICAucGFyZW50KGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KSlcbiAgICAgIC50aXRsZSgnQ29uZmlybScpXG4gICAgICAuY29udGVudCgnV291bGQgeW91IGxpa2UgdG8gYXJjaGl2ZSB0aGlzIHJlcG8/JylcbiAgICAgIC5vaygnWWVzIScpXG4gICAgICAuY2FuY2VsKCdObyEnKTtcblxuXHRcdCRtZERpYWxvZy5zaG93KGNvbmZpcm0pLnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHQvL2FmdGVyIGNvbmZpcm0gdG8gYXJjaGl2ZVxuXHRcdFx0Ly9hZGQgcmVwbyB0byB1c2VyLmFyY2hpdmVzXG5cdFx0XHQkc2NvcGUudXNlci5hcmNoaXZlcy5wdXNoKHJlcG8pO1xuXHRcdFx0Y29uc29sZS5sb2coJHNjb3BlLnVzZXIuYXJjaGl2ZXMpO1xuXHRcdFx0cG9wdXBHaXRGYWN0b3J5LmFyY2hpdmVSZXBvKCRzY29wZS51c2VyKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRjb25zb2xlLmxvZygnYXJjaGl2ZWQgdG8gZGInLCByZXMpXG5cdFx0XHR9KVxuXG5cdFx0XHQvL2RlbGV0ZSByZXBvIGZyb20gdXNlci5yZXBvc1xuXHRcdFx0JHNjb3BlLnVzZXIucmVwb3MuZm9yRWFjaChmdW5jdGlvbih1c2VycmVwbywgaSkge1xuXHRcdFx0XHRpZiAodXNlcnJlcG8uX2lkID09PSByZXBvLl9pZCkgJHNjb3BlLnVzZXIucmVwb3Muc3BsaWNlKGksMSk7XG5cdFx0XHR9KVxuXHRcdFx0cG9wdXBHaXRGYWN0b3J5LmVkaXRSZXBvKCRzY29wZS51c2VyKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRjb25zb2xlLmxvZygnZGVsZXRlZCByZXBvJywgcmVzKVxuXHRcdFx0fSlcblxuICAgIH0pO1xuXG5cdH1cblxuXHQkc2NvcGUuZ29Ub1JlcG8gPSBmdW5jdGlvbihyZXBvKSB7XG5cdFx0Y2hyb21lLnRhYnMuY3JlYXRlKHtcbiAgICAgICAgdXJsOiByZXBvLnVybFxuICAgIH0pO1xuXHR9XG5cblx0Ly9saXN0IGZpbGVzIHVuZGVyIGEgcmVwb1xuXHQkc2NvcGUubGlzdEZpbGVzID0gZnVuY3Rpb24ocmVwbykge1xuXHRcdHZhciBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvZmlsZXMvZmlsZS5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdGaWxlQ3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHJlcG86IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiByZXBvO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cdH1cblxuXHQvL2xvZyBvdXRcblx0JHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcblx0XHRwb3B1cEdpdEZhY3RvcnkubG9nb3V0KCkudGhlbihmdW5jdGlvbihyZXMpe1xuXHRcdFx0JHN0YXRlLmdvKCdsb2dpbicpO1xuXHRcdFx0Ly8gY2hyb21lLnRhYnMucXVlcnkoe3RpdGxlOiAnSGlnaGxpZ2h0IFlvdXIgV29ybGQnfSwgZnVuY3Rpb24odGFicyl7XG4gICAvLyAgICAgICAgXHRcdHRhYnMuZm9yRWFjaChmdW5jdGlvbih0YWIpe1xuICAgLy8gICAgICAgICAgXHRjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWIuaWQsIG1lc3NhZ2U6ICdsb2dvdXQnKTtcbiAgIC8vICAgICAgICAgIFx0fSlcbiAgIC8vICAgICAgICBcdH0pO1xuXHRcdH0pXG5cdH1cblxuXHQvL3NpZGViYXJcblx0JHNjb3BlLnRvZ2dsZUxlZnQgPSBidWlsZFRvZ2dsZXIoJ2xlZnQnKTtcblxuXHRmdW5jdGlvbiBidWlsZFRvZ2dsZXIobmF2SUQpIHtcbiAgICAgIHZhciBkZWJvdW5jZUZuID0gICRtZFV0aWwuZGVib3VuY2UoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICRtZFNpZGVuYXYobmF2SUQpXG4gICAgICAgICAgICAgIC50b2dnbGUoKVxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZyhcInRvZ2dsZSBcIiArIG5hdklEICsgXCIgaXMgZG9uZVwiKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSwzMDApO1xuICAgICAgcmV0dXJuIGRlYm91bmNlRm47XG4gIH1cblxuXHQkc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkbWRTaWRlbmF2KCdsZWZ0JykuY2xvc2UoKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJGxvZy5kZWJ1ZyhcImNsb3NlIExFRlQgaXMgZG9uZVwiKTtcbiAgICAgICAgfSk7XG4gIFx0fTtcblxuICBcdGZ1bmN0aW9uIGNocm9tZVJlZnJlc2ggKCkge1xuICBcdFx0Y2hyb21lLnRhYnMucXVlcnkoe3RpdGxlOiAnSGlnaGxpZ2h0IFlvdXIgV29ybGQnfSwgZnVuY3Rpb24odGFicyl7XG5cdFx0dGFicy5mb3JFYWNoKGZ1bmN0aW9uKHRhYil7XG5cdFx0XHRjaHJvbWUudGFicy5yZWxvYWQodGFiLmlkKTtcblx0XHRcdH0pXG5cdFx0fSlcbiAgXHR9O1xuXG59KVxuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuXHRcdHVybDogJy8nLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2xvZ2luL2xvZ2luLmh0bWwnLFxuXHRcdGNvbnRyb2xsZXI6ICdMb2dpbkNvbnRyb2xsZXInLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdExvZ2luOiBmdW5jdGlvbigkaHR0cCwgJHN0YXRlKSB7XG5cdFx0XHRcdCRodHRwLmdldChcImh0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9zZXNzaW9uXCIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdFx0aWYocmVzLmRhdGEpIHtcblx0XHRcdFx0XHRcdCRzdGF0ZS5nbygnaG9tZScpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdMb2dpbkNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgcG9wdXBHaXRGYWN0b3J5KXtcbiAgJHNjb3BlLm1lc3NhZ2UgPSBcIkNoZWNrIHRoaXMgcGFnZSBvdXQgbm93IVwiO1xuXG5cdC8vICRzY29wZS5sb2dnZWRpbiA9IGZhbHNlO1xuXG5cdCRzY29wZS5naXRMb2dpbiA9IGZ1bmN0aW9uKCkge1xuXHRcdC8vbmVlZCB0byBjaGFuZ2UgbG9jYWxob3N0OjEzMzcgdG8gdGhlIGFwcHJvcHJpYXRlIGRvbWFpbiBuYW1lIGFmdGVyIGRlcGxveW1lbnQhISFcblx0XHRjb25zb2xlLmxvZygnZ2l0TG9naW4nKVxuXHRcdCRzY29wZS5TdWNjZXNzZnVsTG9naW4oKTtcblx0XHRjaHJvbWUudGFicy5jcmVhdGUoe1xuICAgICAgICB1cmw6IFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L2F1dGgvZ2l0aHViXCJcbiAgICB9KTtcblxuXHR9XG5cblxuXHQvLyBjb25zb2xlLmxvZyhzZXNzaW9uKVxuXG5cblx0JHNjb3BlLlN1Y2Nlc3NmdWxMb2dpbiA9IGZ1bmN0aW9uKCkge1xuXHRcdGNvbnNvbGUubG9nKCdzdWNjZXNzdWZsbHkgbG9nZ2luJylcblxuXHRcdCRzdGF0ZS5nbygnaG9tZScpXG5cdFx0Z2V0TmFtZSgpO1xuXHRcdC8vICRzY29wZS5sb2dnZWRpbiA9IHRydWU7XG5cdH1cblxuXHR2YXIgZ2V0TmFtZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHBvcHVwR2l0RmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0Y29uc29sZS5sb2coJ2dldE5hbWUnLCBkYXRhKTtcblx0XHRcdC8vICRzY29wZS5uYW1lID1cblx0XHR9KVxuXHR9XG59KVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9

