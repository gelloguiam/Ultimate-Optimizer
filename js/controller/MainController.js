var ulopt = angular.module('ultimateOptimizer', []);

ulopt.controller('MainController', function($scope, $http){
	$scope.components = null;
	$scope.stations = null;
	$scope.goal = null;

	$http.get("data/components.json").success(function(response){
		$scope.components = response;
	});

	$http.get("data/riverstations.json").success(function(response){
		$scope.stations = response;
	});

	$scope.setGoalMAX = function() {
		$scope.goal = "Maximize";
		$("#hover-panel").slideUp();
		$("table").slideDown();
	}

	$scope.setGoalMIN = function() {
		$scope.goal = "Minimize";
		$("#hover-panel").slideUp();
	}

});


