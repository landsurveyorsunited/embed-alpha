angular.module("Embed").controller("SourceController", function($scope, $location, safeApply, ioapi, data) {

	$scope.loading = true;

	$scope.page = 1;

	$scope.data = [];

	$scope.total = 0;
	$scope.ipp = 20;

	$scope.searchterm = "";

	$scope.executeSearch = function(term) {
		$scope.searchterm = term;
		$scope.page = 1;
		doSearch();
	}

	var doSearch = function() {
		$scope.loading = true;
		safeApply($scope);
		ioapi.bucket("connector").search($scope.searchterm, {
			"_sort": "_meta.creationTimestamp",
			"_sortDirection": "desc",
			"status": "WORKING",
			"type": ["LIVE_WEB", "EXTRACTOR"],
			"_mine": "true",
			"_meta": "true",
			"page": $scope.page,
			"_type": "match_phrase_prefix",
			"_field": "name"
		}).done(function(data) {
			$scope.data = data.hits.hits.map(function(row) {
				row.fields.guid = row._id;
				return row.fields;
			});
			$scope.total = data.hits.total;
			$scope.loading = false;
			safeApply($scope);
		});
	}
	
	var init = function() {
		if (data.get("authenticated")) {
			doSearch();
		} else {
			$location.path("/login");
		}
	}
	init();

	$scope.nextPage = function() {
		$scope.page++;
		doSearch();
	}

	$scope.previousPage = function() {
		$scope.page--;
		if ($scope.page < 1) {
			$scope.page = 1;
		}
		doSearch();
	}

	$scope.getIcon = function(type) {
		switch(type) {
			case "LIVE_WEB":
				return "search";
			case "EXTRACTOR":
				return "table";
		}
		return "question-circle";
	}

	$scope.chooseSource = function(row) {
		data.set("source", row);
		$location.path("/widget/" + row.guid);
	}

});