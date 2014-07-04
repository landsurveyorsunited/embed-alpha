angular.module("Embed", ["ngRoute", "importio", "cookie"]);

angular.module("Embed").config(function($provide, $locationProvider, $routeProvider) {
	
	$locationProvider
	.html5Mode(true);
	
	$routeProvider
	.when("/login", {
		"templateUrl": "/html/login.html",
		"controller": "LoginController"
	})
	.when("/source", {
		"templateUrl": "/html/source.html",
		"controller": "SourceController"
	})
	.when("/widget/:source_guid", {
		"templateUrl": "/html/widget.html",
		"controller": "WidgetController"
	})
	.otherwise({
		"redirectTo": "/login"
	});
});