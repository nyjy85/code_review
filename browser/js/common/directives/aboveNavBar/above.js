app.directive('above', function(AuthService, $rootScope, AUTH_EVENTS, $state){

	return {
		restrict: 'E',
		scope: {},
		templateUrl: 'js/common/directives/aboveNavBar/above.html',
    controller: 'LoginCtrl',
		//------------
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

						//------------
						scope.notifications = function () {

								//------------
								scope.user.notifications.map(function(n){
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

									//------------
									message.forEach(function(msg) {
										if (n.update === msg.update) {
											n.display = msg.display;
										}
									})
									//------------

								})
								//------------
								scope.noti = scope.user.notifications;
						}
						//------------
					}
//------------
		}
            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);
		// }
	})

// 	};
// });
