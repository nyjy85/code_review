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
            return res.data;
          });
        },

        getReposToAdd: function(token) {
          console.log('hit getrepo', token)
          return $http.get(domain + "/api/git/reposFromGit", {params: token})
          .then(function(res) {
            return res.data;
          })
        },

        addRepoToProfile: function(user, repo) {
          console.log('addRepoToProfile factory',user, repo)
          var repo = {repo: {url: repo.html_url, name: repo.name}}
          return $http.put(domain + "/api/users/addRepo/" + user.github.username, repo)
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
app.config(function ($stateProvider) {
	$stateProvider.state('file', {
		url: '/file',
		templateUrl: 'js/application/states/files/file.html',
		controller: 'FileCtrl',
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
app.controller('FileCtrl', function ($scope, $state, popupGitFactory) {

  popupGitFactory.getUserInfo().then(function(user) {
		$scope.user = user.user;
		$scope.displayName = $scope.user.github.name;

	})

	// $scope.showYourFiles = $scope.user.repos;

	$scope.goToFile = function(repo) {
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
app.controller('HomeCtrl', function ($scope, $state, popupGitFactory, $timeout, $mdSidenav, $mdUtil, $log) {

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZhY3Rvcmllcy9wb3B1cEdpdEZhY3RvcnkuanMiLCJkaXJlY3RpdmVzL3NpZGViYXIvc2lkZWJhci5qcyIsInN0YXRlcy9maWxlcy9maWxlLmpzIiwic3RhdGVzL2hvbWUvaG9tZS5qcyIsInN0YXRlcy9sb2dpbi9sb2dpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdDb2RlUmV2aWV3RXh0JywgWyd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nTWF0ZXJpYWwnXSk7XG5cblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlciwgJGNvbXBpbGVQcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUoe1xuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICByZXF1aXJlQmFzZTogZmFsc2VcbiAgICB9KTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cblxuICAgIC8vIHdoaXRlbGlzdCB0aGUgY2hyb21lLWV4dGVuc2lvbjogcHJvdG9jb2xcbiAgICAvLyBzbyB0aGF0IGl0IGRvZXMgbm90IGFkZCBcInVuc2FmZTpcIlxuICAgICRjb21waWxlUHJvdmlkZXIuYUhyZWZTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8bWFpbHRvfGNocm9tZS1leHRlbnNpb24pOi8pO1xuICAgICRjb21waWxlUHJvdmlkZXIuaW1nU3JjU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfGZpbGV8bG9jYWx8Y2hyb21lLWV4dGVuc2lvbik6fGRhdGE6aW1hZ2VcXC8vKTtcblxufSk7XG4iLCJhcHAuZmFjdG9yeSgncG9wdXBHaXRGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApIHtcbiAgICB2YXIgZG9tYWluID0gXCJodHRwOi8vbG9jYWxob3N0OjEzMzdcIjtcblxuICAgIHJldHVybiB7XG4gICAgICAgIC8vIGdldEFsbFByb2RzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gICAgIC8vZ2V0cyBsaXN0IG9mIGFsbCBhdmFpbGFibGUgcHJvZHVjdHMgZnJvbSBzdG9yZVxuICAgICAgICAvLyAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4ucGF0aCArICcvYXBpL3N0b3JlLycpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIC8vICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0sXG4gICAgICAgIGdldFVzZXJJbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGRvbWFpbiArIFwiL3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFJlcG9zVG9BZGQ6IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2hpdCBnZXRyZXBvJywgdG9rZW4pXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9hcGkvZ2l0L3JlcG9zRnJvbUdpdFwiLCB7cGFyYW1zOiB0b2tlbn0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRSZXBvVG9Qcm9maWxlOiBmdW5jdGlvbih1c2VyLCByZXBvKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2FkZFJlcG9Ub1Byb2ZpbGUgZmFjdG9yeScsdXNlciwgcmVwbylcbiAgICAgICAgICB2YXIgcmVwbyA9IHtyZXBvOiB7dXJsOiByZXBvLmh0bWxfdXJsLCBuYW1lOiByZXBvLm5hbWV9fVxuICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoZG9tYWluICsgXCIvYXBpL3VzZXJzL2FkZFJlcG8vXCIgKyB1c2VyLmdpdGh1Yi51c2VybmFtZSwgcmVwbylcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICB9XG59KTtcblxuXG4vL2V4dGVuc2lvbiBvblxuLy90YWIgYmFyXG4vL1xuIiwiLy8gJ3VzZSBzdHJpY3QnO1xuLy8gYXBwLmRpcmVjdGl2ZSgnc2lkZWJhcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJHRpbWVvdXQsICRtZFNpZGVuYXYsICRsb2cpIHtcbi8vXG4vLyAgICAgcmV0dXJuIHtcbi8vICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbi8vICAgICAgICAgc2NvcGU6IHt9LFxuLy8gICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL3NpZGViYXIvc2lkZWJhci5odG1sJyxcbi8vICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG4vL1xuLy8gICAgICAgICAgIHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuLy8gICAgICAgICAgICRtZFNpZGVuYXYoJ3JpZ2h0JykuY2xvc2UoKVxuLy8gICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuLy8gICAgICAgICAgICAgICAkbG9nLmRlYnVnKFwiY2xvc2UgTEVGVCBpcyBkb25lXCIpO1xuLy8gICAgICAgICAgICAgfSk7XG4vLyAgICAgICAgICAgfTtcbi8vXG4vLyAgICAgICAgIH1cbi8vICAgICB9XG4vL1xuLy8gICB9XG4vLyB9KTtcbiIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdmaWxlJywge1xuXHRcdHVybDogJy9maWxlJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9maWxlcy9maWxlLmh0bWwnLFxuXHRcdGNvbnRyb2xsZXI6ICdGaWxlQ3RybCcsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0QXV0aGVudGljYXRlOiBmdW5jdGlvbigkaHR0cCwgJHN0YXRlKSB7XG5cdFx0XHRcdCRodHRwLmdldChcImh0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9zZXNzaW9uXCIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdFx0aWYgKHJlcy5kYXRhKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHQkc3RhdGUuZ28oJ2xvZ2luJylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59KTtcblxuLy9hZGQgRmFjdG9yeVxuYXBwLmNvbnRyb2xsZXIoJ0ZpbGVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlLCBwb3B1cEdpdEZhY3RvcnkpIHtcblxuICBwb3B1cEdpdEZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcblx0XHQkc2NvcGUudXNlciA9IHVzZXIudXNlcjtcblx0XHQkc2NvcGUuZGlzcGxheU5hbWUgPSAkc2NvcGUudXNlci5naXRodWIubmFtZTtcblxuXHR9KVxuXG5cdC8vICRzY29wZS5zaG93WW91ckZpbGVzID0gJHNjb3BlLnVzZXIucmVwb3M7XG5cblx0JHNjb3BlLmdvVG9GaWxlID0gZnVuY3Rpb24ocmVwbykge1xuXHRcdGNocm9tZS50YWJzLmNyZWF0ZSh7XG4gICAgICAgIHVybDogZmlsZS51cmxcbiAgICB9KTtcblx0fVxuXG5cbn0pXG5cblxuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbnlqeTg1L2NvZGVfcmV2aWV3L2NvbW1pdC80ZTBmN2VjMzM1Mzk4MDQzMTZkZmZmNzg2YjgwYmU4NmRlNjcyZWE0XG4vLyBodHRwczovL2dpdGh1Yi5jb20vbnlqeTg1L2NvZGVfcmV2aWV3L2Jsb2IvcmlnaHRDbGljay9icm93c2VyL3Njc3MvaG9tZS9tYWluLnNjc3NcblxuLy8gQnJhbmNoOiByaWdodENsaWNrXG4vLyBSZXBvIE5hbWU6IGNvZGVfcmV2aWV3XG4vLyBGaWxlczogL2Jyb3dzZXIvc2Nzcy9ob21lL21haW4uc2Nzc1xuIiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG5cdFx0dXJsOiAnL2hvbWUnLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2hvbWUvaG9tZS5odG1sJyxcblx0XHRjb250cm9sbGVyOiAnSG9tZUN0cmwnLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdEF1dGhlbnRpY2F0ZTogZnVuY3Rpb24oJGh0dHAsICRzdGF0ZSkge1xuXHRcdFx0XHQkaHR0cC5nZXQoXCJodHRwOi8vbG9jYWxob3N0OjEzMzcvc2Vzc2lvblwiKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRcdGlmIChyZXMuZGF0YSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gJHN0YXRlLmdvKCdsb2dpbicpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufSk7XG5cbi8vYWRkIEZhY3RvcnlcbmFwcC5jb250cm9sbGVyKCdIb21lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgcG9wdXBHaXRGYWN0b3J5LCAkdGltZW91dCwgJG1kU2lkZW5hdiwgJG1kVXRpbCwgJGxvZykge1xuXG4gIHBvcHVwR2l0RmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24odXNlcikge1xuXHRcdCRzY29wZS51c2VyID0gdXNlci51c2VyO1xuXHRcdCRzY29wZS5kaXNwbGF5TmFtZSA9ICRzY29wZS51c2VyLmdpdGh1Yi5uYW1lO1xuXHRcdCRzY29wZS5zaG93WW91clJlcG9zID0gJHNjb3BlLnVzZXIucmVwb3M7XG5cblx0fSlcblxuXG5cdCRzY29wZS5zaG93QWRkQmFyID0gZmFsc2U7XG5cblx0JHNjb3BlLnNob3dSZXBvU2VsZWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuXHRcdC8vTG9hZCByZXBvcyB0byBhZGRcblx0XHR2YXIgdG9rZW5PYmogPSB7dG9rZW46ICRzY29wZS51c2VyLmdpdGh1Yi50b2tlbn1cblx0XHRwb3B1cEdpdEZhY3RvcnkuZ2V0UmVwb3NUb0FkZCh0b2tlbk9iaikudGhlbihmdW5jdGlvbihyZXBvcykge1xuXHRcdFx0JHNjb3BlLnJlcG9zVG9BZGQgPSByZXBvcztcblx0XHR9KVxuXG5cdFx0JHNjb3BlLnNob3dBZGRCYXIgPSAhJHNjb3BlLnNob3dBZGRCYXI7XG5cdH1cblxuXG5cdCRzY29wZS5hZGRSZXBvVG9Qcm9maWxlID0gZnVuY3Rpb24gKHJlcG8pIHtcblx0XHRjb25zb2xlLmxvZygnYWRkIHJlcG8gdG8gcHJvZmlsZScsICRzY29wZS5hZGRSZXBvKVxuXHRcdCRzY29wZS5zaG93QWRkQmFyID0gISRzY29wZS5zaG93QWRkQmFyO1xuXHRcdHBvcHVwR2l0RmFjdG9yeS5hZGRSZXBvVG9Qcm9maWxlKCRzY29wZS51c2VyLCByZXBvKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0Y29uc29sZS5sb2cocmVzKVxuXHRcdH0pXG5cdH1cblxuXHQkc2NvcGUuc2VsZWN0UmVwbyA9IGZ1bmN0aW9uKHJlcG8pIHtcblx0XHRyZXBvLnNob3dPcHRpb25zID0gIXJlcG8uc2hvd09wdGlvbnM7XG5cdH1cblxuXHQkc2NvcGUuZ29Ub1JlcG8gPSBmdW5jdGlvbihyZXBvKSB7XG5cdFx0Y2hyb21lLnRhYnMuY3JlYXRlKHtcbiAgICAgICAgdXJsOiByZXBvLnVybFxuICAgIH0pO1xuXHR9XG5cblxuXHQkc2NvcGUudG9nZ2xlTGVmdCA9IGJ1aWxkVG9nZ2xlcignbGVmdCcpO1xuXG5cdGZ1bmN0aW9uIGJ1aWxkVG9nZ2xlcihuYXZJRCkge1xuICAgICAgdmFyIGRlYm91bmNlRm4gPSAgJG1kVXRpbC5kZWJvdW5jZShmdW5jdGlvbigpe1xuICAgICAgICAgICAgJG1kU2lkZW5hdihuYXZJRClcbiAgICAgICAgICAgICAgLnRvZ2dsZSgpXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKFwidG9nZ2xlIFwiICsgbmF2SUQgKyBcIiBpcyBkb25lXCIpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LDMwMCk7XG4gICAgICByZXR1cm4gZGVib3VuY2VGbjtcbiAgICB9XG5cbn0pXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XG5cdFx0dXJsOiAnLycsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9hcHBsaWNhdGlvbi9zdGF0ZXMvbG9naW4vbG9naW4uaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ0xvZ2luQ29udHJvbGxlcicsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0TG9naW46IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcblx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0XHRpZihyZXMuZGF0YSkge1xuXHRcdFx0XHRcdFx0JHN0YXRlLmdvKCdob21lJylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCBwb3B1cEdpdEZhY3Rvcnkpe1xuICAkc2NvcGUubWVzc2FnZSA9IFwiQ2hlY2sgdGhpcyBwYWdlIG91dCBub3chXCI7XG5cblx0Ly8gJHNjb3BlLmxvZ2dlZGluID0gZmFsc2U7XG5cblx0JHNjb3BlLmdpdExvZ2luID0gZnVuY3Rpb24oKSB7XG5cdFx0Ly9uZWVkIHRvIGNoYW5nZSBsb2NhbGhvc3Q6MTMzNyB0byB0aGUgYXBwcm9wcmlhdGUgZG9tYWluIG5hbWUgYWZ0ZXIgZGVwbG95bWVudCEhIVxuXHRcdGNvbnNvbGUubG9nKCdnaXRMb2dpbicpXG5cdFx0JHNjb3BlLlN1Y2Nlc3NmdWxMb2dpbigpO1xuXHRcdGNocm9tZS50YWJzLmNyZWF0ZSh7XG4gICAgICAgIHVybDogXCJodHRwOi8vbG9jYWxob3N0OjEzMzcvYXV0aC9naXRodWJcIlxuICAgIH0pO1xuXG5cdH1cblxuXG5cdC8vIGNvbnNvbGUubG9nKHNlc3Npb24pXG5cblxuXHQkc2NvcGUuU3VjY2Vzc2Z1bExvZ2luID0gZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coJ3N1Y2Nlc3N1ZmxseSBsb2dnaW4nKVxuXG5cdFx0JHN0YXRlLmdvKCdob21lJylcblx0XHRnZXROYW1lKCk7XG5cdFx0Ly8gJHNjb3BlLmxvZ2dlZGluID0gdHJ1ZTtcblx0fVxuXG5cdHZhciBnZXROYW1lID0gZnVuY3Rpb24oKSB7XG5cdFx0cG9wdXBHaXRGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnZ2V0TmFtZScsIGRhdGEpO1xuXHRcdFx0Ly8gJHNjb3BlLm5hbWUgPVxuXHRcdH0pXG5cdH1cbn0pXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=