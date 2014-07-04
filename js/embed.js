angular.module("Embed", ["importio"]);

angular.module("Embed").config(function($provide, $locationProvider) {
	
	$locationProvider
	.html5Mode(true);

});