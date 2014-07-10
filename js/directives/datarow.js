angular.module("Embed").directive("datarow", function () {
	return {
		"restrict": "E",
		"templateUrl": "html/datarow.html",
		"controller": function($scope, safeApply) {

			$scope.d = function(field, supplementary) {
				return $scope.d_row($scope.row, field, supplementary);
			}

		}
	}
});