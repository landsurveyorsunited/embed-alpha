angular.module("Embed").factory("data", function($rootScope) {

	var data = {
		"designs": [
			{
				"name": "Owen the iOwl",
				"id": "owen",
				"image_position": "left",
				"image": "owen"
			},
			{
				"name": "Needy Owl",
				"id": "needy",
				"image_position": "left",
				"image": "needy"
			},
			{
				"name": "Pointy Owl",
				"id": "pointy",
				"image_position": "right",
				"image": "pointy"
			},
			{
				"name": "Smart Owl",
				"id": "smart",
				"image_position": "right",
				"image": "smart"
			},
			{
				"name": "Tall Owl",
				"id": "tall",
				"image_position": "right",
				"image": "tall"
			}
		]
	};

	return {
		"get": function(key) {
			return data[key] || false;
		},
		"set": function(key, val) {
			data[key] = val;
			return val;
		},
		"remove": function(key) {
			delete data[key];
		}
	}

});