angular.module("Embed").factory("safeApply", function($rootScope) {

	return function($scope) {
		try {
			if (!$scope) {
				console.error("safeApply not applied as no scope was provided");
				return;
			}
			if ($scope.$root.$$phase != "$apply" && $scope.$root.$$phase != "$digest") {
				$scope.$apply();
			}
		} catch (e) {
			console.error("safeApply threw error", e);
		}
	}

});