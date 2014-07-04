angular.module("Embed").directive("datarow", function () {
	return {
		"restrict": "E",
		"templateUrl": "html/datarow.html",
		"controller": function($scope, safeApply) {

			$scope.d = function(field, supplementary) {
				return $scope.row[$scope.mappings[field].list[$scope.mappings[field].current] + (supplementary ? '/_' + supplementary : '')];
			}

		}
	}
});