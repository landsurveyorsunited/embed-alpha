angular.module("Embed").controller("LoginController", function($scope, $location, safeApply, ioauth, data, cacookie) {

	// login, loading
	$scope.mode = "login";

	$scope.remember = true;

	$scope.reset = function() {
		$scope.mode = "login";
	}

	$scope.submitForm = function(user_guid, api_key, remember) {
		$scope.mode = "loading";
		importio.init({
			"auth": {
				"userGuid": user_guid,
				"apiKey": api_key
			}
		});
		ioauth.auth.currentuser().done(function() {
			$location.path("/source");
			data.set("user_guid", user_guid);
			data.set("api_key", api_key);
			data.set("authenticated", true);
			if (remember) {
				cacookie.create("embed_user_guid", user_guid, 1000*60*60);
				cacookie.create("embed_api_key", api_key, 1000*60*60);
			}
			safeApply($scope);
		}).fail(function() {
			$scope.mode = "error";
			data.remove("user_guid");
			data.remove("api_key");
			safeApply($scope);
		});
	}

	var init = function() {
		var user_guid = cacookie.read("embed_user_guid");
		var api_key = cacookie.read("embed_api_key");
		if (user_guid && api_key) {
			$scope.submitForm(user_guid, api_key, false);
		}
	}
	init();

});