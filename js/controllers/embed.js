angular.module("Embed").controller("EmbedController", function($scope, $location, safeApply, data, ioquery) {

	var requestData = $location.search();

	$scope.source_guid = requestData.source;
	$scope.user_guid = requestData.user_guid;
	$scope.api_key = requestData.api_key;
	$scope.title = requestData.title;
	$scope.amount = requestData.amount;
	$scope.design = false;
	data.get("designs").map(function(row) {
		if (row.id == requestData.design) {
			$scope.design = row;
		}
	});
	$scope.queryInput = JSON.parse(requestData.queryInput);

	$scope.data = [];

	$scope.loading = false;

	$scope.rows = {
		"dates": "Do MMM YYYY, hh:mma"
	}

	$scope.moment = moment;

	$scope.getPageCount = function() {
		switch($scope.amount) {
			case "1row":
			case "3rows":
			case "5rows":
			case "10rows":
			case "1page":
				return 1;
			case "3pages":
				return 3;
			case "5pages":
				return 5;
			case "all":
				return 10;
		}
	}

	$scope.mappings = {
		"heading": {
			"list": [requestData.heading],
			"current": requestData.heading ? 0 : -1
		},
		"description": {
			"list": [requestData.description],
			"current": requestData.description ? 0 : -1
		},
		"date": {
			"list": [requestData.date],
			"current": requestData.date ? 0 : -1
		},
		"image": {
			"list": [requestData.image],
			"current": requestData.image ? 0 : -1
		},
		"link": {
			"list": [requestData.link],
			"current": requestData.link ? 0 : -1
		}
	}

	var getData = function() {
		$scope.loading = true;
		importio.init({
			"auth": {
				"userGuid": $scope.user_guid,
				"apiKey": $scope.api_key
			}
		});
		ioquery.query({
			"connectorGuids": [$scope.source_guid],
			"input": $scope.queryInput,
			"maxPages": $scope.getPageCount()
		}).then(function(data) {
			$scope.data = data.map(function(row) {
				for (var k in row.data) {
					if (Object.prototype.toString.call(row.data[k]) === '[object Array]') {
						row.data[k] = row.data[k][0];
					}
				}
				return row.data;
			});
			switch ($scope.amount) {
				case "1row":
					$scope.data = $scope.data.slice(0, 1);
					break;
				case "3rows":
					$scope.data = $scope.data.slice(0, 3);
					break;
				case "5rows":
					$scope.data = $scope.data.slice(0, 5);
					break;
				case "10rows":
					$scope.data = $scope.data.slice(0, 10);
					break;
			}
			$scope.loading = false;
			safeApply($scope);
		});
	}
	getData();

});