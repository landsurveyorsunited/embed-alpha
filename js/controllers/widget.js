angular.module("Embed").controller("WidgetController", function($scope, $location, $routeParams, safeApply, ioquery, ioapi, data) {

	$scope.source_guid = $routeParams.source_guid;
	$scope.version_guid = data.get("source").latestVersionGuid;
	$scope.title = data.get("source").name;

	$scope.data = [];

	$scope.loading = false;

	$scope.inputs = false;
	$scope.outputs = false;
	$scope.queryInput = false;

	$scope.rows = {
		"editable": true,
		"dates": "Do MMM YYYY, hh:mma"
	}

	// data, style, embed
	$scope.guide = "data";

	$scope.changeGuide = function(newGuide) {
		$scope.guide = newGuide;
	}

	$scope.setTitle = function(title) {
		$scope.title = title;
	}

	$scope.height = 500;

	$scope.setHeight = function(height) {
		$scope.height = height;
	}

	// 1row, 3rows, 5rows, 10rows, 1page, 3pages, 5pages, all
	$scope.amount = "1page";

	$scope.setDataAmount = function(amount) {
		$scope.amount = amount;
		getData();
	}

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

	$scope.design = data.get("designs")[0];

	$scope.changeDesign = function(design_id) {
		data.get("designs").map(function(design) {
			if (design.id == design_id) {
				$scope.design = design;
			}
		});
	}

	$scope.designs = data.get("designs");

	$scope.moment = moment;

	$scope.mappings = {
		"heading": {
			"list": [],
			"current": -1
		},
		"description": {
			"list": [],
			"current": -1
		},
		"date": {
			"list": [],
			"current": -1
		},
		"image": {
			"list": [],
			"current": -1
		},
		"link": {
			"list": [],
			"current": -1
		}
	}

	$scope.changeSuggestion = function(field) {
		if (!$scope.mappings.hasOwnProperty(field) || $scope.mappings[field].current < 0) {
			return;
		}
		$scope.mappings[field].current++;
		if ($scope.mappings[field].current >= $scope.mappings[field].list.length) {
			$scope.mappings[field].current = 0;
		}
	}

	$scope.removeSuggestion = function(field) {
		if (!$scope.mappings.hasOwnProperty(field) || $scope.mappings[field].current < 0) {
			return;
		}
		$scope.mappings[field].current = -1;
	}

	$scope.acquireSuggestions = function() {
		$scope.outputs.map(function(output) {
			switch(output.type) {
				case "STRING":
					$scope.mappings.description.list.push(output.name);
					$scope.mappings.description.current = 0;
				case "CURRENCY":
				case "LANG":
				case "COUNTRY":
				case "BOOLEAN":
					$scope.mappings.heading.list.push(output.name);
					$scope.mappings.heading.current = 0;
					break;
				case "DATE":
					$scope.mappings.date.list.push(output.name);
					$scope.mappings.date.current = 0;
					break;
				case "URL":
					$scope.mappings.link.list.push(output.name);
					$scope.mappings.link.current = 0;
					break;
				case "IMAGE":
					$scope.mappings.image.list.push(output.name);
					$scope.mappings.image.current = 0;
					break;
				case "INT":
				case "FLOAT":
				case "DOUBLE":
				case "HTML":
					break;
			}
		});
	}

	var getData = function() {
		if ($scope.loading) {
			return;
		}
		$scope.loading = true;

		var versionLoaded = false;
		var dataLoaded = false;

		ioapi.bucket("connectorversion").object($scope.version_guid).children("schema").get()
		.then(function(data) {
			$scope.inputs = data.inputProperties;
			$scope.outputs = data.outputProperties;
			$scope.loading = !dataLoaded;
			$scope.acquireSuggestions();
			versionLoaded = true;
			safeApply($scope);
		});

		ioapi.bucket("connectorversion").object($scope.version_guid).children("tests").get()
		.done(function(tests) {
			$scope.queryInput = tests.testQueries[0].input;
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
				$scope.loading = !versionLoaded;
				dataLoaded = true;
				safeApply($scope);
			});
		});

	}
	var init = function() {
		if (data.get("authenticated")) {
			getData();
		} else {
			$location.path("/login");
		}
	}
	init();

	$scope.getEmbedCode = function() {
		var url = "http://alpha.embed.import.io/embed/?user_guid=" + data.get("user_guid") + "&amp;api_key=" + encodeURIComponent(data.get("api_key")) + "&amp;source=" + $scope.source_guid + "&amp;design=" + $scope.design.id + "&amp;title=" + encodeURIComponent($scope.title) + "&amp;queryInput=" + encodeURIComponent(JSON.stringify($scope.queryInput)) + "&amp;amount=" + $scope.amount;
		for (var k in $scope.mappings) {
			var mapping = $scope.mappings[k];
			if (mapping.current >= 0) {
				url += "&amp;" + k + "=" + mapping.list[mapping.current];
			}
		}
		return '<iframe src="' + url + '" style="width:100%;height:' + $scope.height + 'px;border:1px solid #ccc;"></iframe>';
	}

});