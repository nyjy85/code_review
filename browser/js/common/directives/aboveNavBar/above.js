app.directive('above', function(AuthService, $rootScope, AUTH_EVENTS, $state){

	return {
		restrict: 'E',
		scope: {},
		templateUrl: 'js/common/directives/aboveNavBar/above.html',
        controller: 'LoginCtrl',
		link: function(scope) {
			scope.user = null;

            scope.isLoggedIn = function () {
                return AuthService.isAuthenticated();
            };

            var setUser = function () {
                AuthService.getLoggedInUser().then(function (user) {
                    scope.user = user;
                });
            };

            var removeUser = function () {
                scope.user = null;
            };

            setUser();

            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);

		}

	};
});