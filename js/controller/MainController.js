var ulopt = angular.module('ultimateOptimizer', []);

ulopt.controller('MainController', function($scope){
	$scope.contents = null;
	
	$scope.print = function(){
		console.log($scope.contents);
	}

	$scope.loadData = function(){
		$.getJSON("data/data.json", function(data) {
		 	$scope.contents = data;
			$scope.$apply(function(){
				$scope.contents = data;
			});
		});
	};


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


