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
