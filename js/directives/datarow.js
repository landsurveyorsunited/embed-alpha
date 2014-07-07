angular.module("Embed").directive("datarow", function () {
	return {
		"restrict": "E",
		"templateUrl": "html/datarow.html",
		"controller": function($scope, safeApply) {

			$scope.d = function(field, supplementary) {
				var prefix = $scope.mappings[field].list[$scope.mappings[field].current];
				if (supplementary === true) {
					var attempts = ["text", "title"];
					for (var i = 0; i < attempts.length; i++) {
						var attempt = attempts[i];
						if ($scope.row.hasOwnProperty(prefix + "/_" + attempt)) {
							supplementary = attempt;
							break;
						}
					}
					if (supplementary === true) {
						supplementary = false;
					}
				}
				return $scope.row[prefix + (supplementary ? '/_' + supplementary : '')];
			}

		}
	}
});