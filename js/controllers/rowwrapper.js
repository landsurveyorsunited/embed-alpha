angular.module("Embed").controller("RowWrapper", function($scope) {
	
	$scope.tooMuchText = function() {
		for (var i = 0; i < $scope.data.length; i++) {
			var row = $scope.data[i];
			if ($scope.d_row(row, "heading").length > 80) {
				return true;
			}
			if ($scope.d_row(row, "description").length > 120) {
				return true;
			}
		}
		return false;
	}

	$scope.d_row = function(row, field, supplementary) {
		var prefix = $scope.mappings[field].list[$scope.mappings[field].current];
		if (supplementary === true) {
			var attempts = ["text", "title"];
			for (var i = 0; i < attempts.length; i++) {
				var attempt = attempts[i];
				if (row.hasOwnProperty(prefix + "/_" + attempt)) {
					supplementary = attempt;
					break;
				}
			}
			if (supplementary === true) {
				supplementary = false;
			}
		}
		return row[prefix + (supplementary ? '/_' + supplementary : '')];
	}

});