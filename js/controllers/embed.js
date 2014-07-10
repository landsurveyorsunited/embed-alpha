angular.module("Embed").controller("EmbedController", function($scope, $location, safeApply, data, ioquery) {

	var requestData = $location.search();

	$scope.source_guid = requestData.source;
	$scope.user_guid = requestData.user_guid;
	$scope.api_key = requestData.api_key;
	$scope.title = requestData.title;
	$scope.amount = requestData.amount;
	$scope.userInput = requestData.userInput;
	$scope.design = false;
	data.get("designs").map(function(row) {
		if (row.id == requestData.design) {
			$scope.design = row;
		}
	});
	$scope.queryInput = JSON.parse(requestData.queryInput);
	$scope.customUrls = JSON.parse(requestData.customUrls);
	$scope.customColour = requestData.customColour;
	$scope.showOwl = requestData.showOwl == "true";
	$scope.initiallyLoaded = false;
	$scope.inputUrl = $scope.userInput == "dropdown" ? $scope.queryInput["webpage/url"] : false;

	$scope.data = [];

	$scope.loading = false;

	$scope.rows = {
		"dates": "Do MMM YYYY, hh:mma"
	}

	$scope.getCustomStyle = function(background) {
		if ($scope.design.id == "custom") {
			var obj = {}
			obj[(background ? "background-" : "") + "color"] = "#" + $scope.customColour;
			return obj;
		}
		return {};
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
		},
		"price": {
			"list": [requestData.price],
			"current": requestData.price ? 0 : -1
		}
	}

	$scope.getInputCount = function() {
		if (!$scope.queryInput) {
			return 0;
		}
		return Object.keys($scope.queryInput).length;
	}

	var getData = function(overwriteUrl) {
		$scope.loading = true;
		importio.init({
			"auth": {
				"userGuid": $scope.user_guid,
				"apiKey": $scope.api_key
			}
		});
		if (overwriteUrl) {
			$scope.inputUrl = overwriteUrl;
		}
		ioquery.query({
			"connectorGuids": [$scope.source_guid],
			"input": $scope.inputUrl ? { "webpage/url": $scope.inputUrl } : $scope.queryInput,
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
			$scope.initiallyLoaded = true;
			safeApply($scope);
		});
	}
	getData();
	$scope.reloadData = function(overwriteUrl) {
		getData(overwriteUrl);
	}

});