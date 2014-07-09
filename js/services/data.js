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
				"name": "Beaked Owl",
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
			},
			{
				"name": "Shy Owl",
				"id": "shy",
				"image_position": "left",
				"image": "shy"
			},
			{
				"name": "Custom Owl",
				"id": "custom",
				"image_position": "left",
				"image": "custom",
				"list_image": "template"
			},
			{
				"name": "Developer Owl",
				"id": "owl",
				"image_position": "left",
				"image": "owl",
				"ee": true
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