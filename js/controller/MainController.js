var ulopt = angular.module('ultimateOptimizer', []);

ulopt.controller('MainController', function($scope){
	$scope.contents = null;

	$scope.loadData = function() {
		$.getJSON("data/data.json", function(data) 	{
			console.log(data);
			$scope.$apply(function(){
				$scope.contents = data;
			});
		});

		console.log($scope.contents);
	}

	$scope.goal = null;

	$scope.setGoalMAX = function() {
		$scope.goal = "Maximize";
		$("#hover-panel").slideUp();
		$scope.loadData();
		$("table").slideDown();
	}

	$scope.setGoalMIN = function() {
		$scope.goal = "Minimize";
		$("#hover-panel").slideUp();
		$scope.loadData();
	}

});


