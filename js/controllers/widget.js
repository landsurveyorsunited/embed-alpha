angular.module("Embed").controller("WidgetController", function($scope, $location, $routeParams, safeApply, ioquery, ioapi, data) {

	$scope.source_guid = $routeParams.source_guid;
	$scope.version_guid = data.get("source").latestVersionGuid;
	$scope.type = data.get("source").type;
	$scope.title = data.get("source").name;

	$scope.availableData = [];
	$scope.data = [];

	$scope.loading = false;

	$scope.inputs = false;
	$scope.outputs = false;
	$scope.queryInput = false;
	$scope.customInputs = false;
	$scope.customTested = false;

	$scope.rows = {
		"dates": "Do MMM YYYY, hh:mma"
	}

	// data, inputs, amount, title, height, style, embed
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
	$scope.amount = "all";

	$scope.setDataAmount = function(amount) {
		$scope.amount = amount;
		getData(false, true, true);
	}

	$scope.setCustomTested = function(val) {
		$scope.customTested = val;
	}

	$scope.setCustomInputs = function(val) {
		if (val) {
			$scope.customTested = false;
		}
		$scope.customInputs = val;
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

	$scope.currentMapping = -1;

	$scope.getCurrentMappingKey = function() {
		return Object.keys($scope.mappings)[$scope.currentMapping];
	}

	$scope.getCurrentMapping = function() {
		return $scope.mappings[$scope.getCurrentMappingKey()];
	}

	$scope.getNextMapping = function() {
		$scope.currentMapping++;
		var keys = Object.keys($scope.mappings);
		if ($scope.currentMapping >= keys.length) {
			$scope.currentMapping = 0;
			$scope.guide = "inputs";
			return;
		}
		var newKey = keys[$scope.currentMapping];
		var newMapping = $scope.mappings[newKey];
		if (newMapping.list.length < 1) {
			$scope.getNextMapping();
			return;
		}
	}
	$scope.ee = data.get("ee");

	$scope.reloadData = function() {
		getData(false, true, true);
	}

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

	$scope.firstSuggestion = function(field) {
		if (!field) {
			field = $scope.getCurrentMappingKey();
		}
		if (!$scope.mappings.hasOwnProperty(field)) {
			return;
		}
		$scope.mappings[field].current = 0;
	}

	$scope.changeSuggestion = function(field) {
		if (!field) {
			field = $scope.getCurrentMappingKey();
		}
		if (!$scope.mappings.hasOwnProperty(field) || $scope.mappings[field].current < 0) {
			return;
		}
		$scope.mappings[field].current++;
		if ($scope.mappings[field].current >= $scope.mappings[field].list.length) {
			$scope.mappings[field].current = 0;
		}
	}

	$scope.removeSuggestion = function(field) {
		if (!field) {
			field = $scope.getCurrentMappingKey();
		}
		if (!$scope.mappings.hasOwnProperty(field) || $scope.mappings[field].current < 0) {
			return;
		}
		$scope.mappings[field].current = -1;
	}

	$scope.acquireSuggestions = function() {
		$scope.outputs.map(function(output) {
			var fields = [];
			switch(output.type) {
				case "STRING":
				case "CURRENCY":
				case "LANG":
				case "COUNTRY":
				case "BOOLEAN":
					fields.push("heading");
					fields.push("description");
					break;
				case "DATE":
					fields.push("date");
					break;
				case "URL":
					fields.push("link");
					fields.push("heading");
					fields.push("description");
					break;
				case "IMAGE":
					fields.push("image");
					break;
				case "INT":
				case "FLOAT":
				case "DOUBLE":
				case "HTML":
					break;
			}
			fields.map(function(field) {
				$scope.mappings[field].list.push(output.name);
				if ($scope.mappings[field].current < 0) {
					$scope.mappings[field].current = $scope.mappings[field].list.length - 1;
				}
			});
		});
	}

	var getData = function(init, ignoreSchema, ignoreSuggestions) {
		if ($scope.loading) {
			return;
		}
		$scope.loading = true;
		$scope.customTested = true;

		var versionLoaded = false;
		var dataLoaded = false;

		ioapi.bucket("connectorversion").object($scope.version_guid).children("schema").get()
		.then(function(data) {
			$scope.inputs = data.inputProperties;
			$scope.outputs = data.outputProperties;
			$scope.loading = !dataLoaded;
			if (!ignoreSuggestions) {
				$scope.acquireSuggestions();
			}
			versionLoaded = true;
			safeApply($scope);
		});

		ioapi.bucket("connectorversion").object($scope.version_guid).children("tests").get()
		.done(function(tests) {
			if (!ignoreSchema) {
				$scope.queryInput = tests.testQueries[0].input;
			}
			ioquery.query({
				"connectorGuids": [$scope.source_guid],
				"input": $scope.queryInput,
				"maxPages": $scope.getPageCount()
			}).then(function(data) {
				$scope.availableData = data.map(function(row) {
					for (var k in row.data) {
						if (Object.prototype.toString.call(row.data[k]) === '[object Array]') {
							row.data[k] = row.data[k][0];
						}
					}
					return row.data;
				});
				$scope.data = $scope.availableData;
				$scope.row = $scope.data[0];
				if (init) {
					$scope.getNextMapping();
				}
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
			getData(true);
		} else {
			$location.path("/login");
		}
	}
	init();

	$scope.getEmbedCode = function() {
		var url = "http://alpha.embed.import.io/embed/?user_guid=" + data.get("user_guid") + "&api_key=" + encodeURIComponent(data.get("api_key")) + "&source=" + $scope.source_guid + "&design=" + $scope.design.id + "&title=" + encodeURIComponent($scope.title) + "&queryInput=" + encodeURIComponent(JSON.stringify($scope.queryInput)) + "&amount=" + $scope.amount;
		for (var k in $scope.mappings) {
			var mapping = $scope.mappings[k];
			if (mapping.current >= 0) {
				url += "&" + k + "=" + mapping.list[mapping.current];
			}
		}
		return '<iframe src="' + url + '" style="width:100%;height:' + $scope.height + 'px;border:1px solid #ccc;"></iframe>';
	}

	$scope.d = function(field, supplementary, i) {
		var prefix = $scope.mappings[field].list[i];
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

});