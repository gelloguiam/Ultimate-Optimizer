var ulopt = angular.module('ultimateOptimizer', []);

ulopt.controller('MainController', ['$scope', function($scope){
	$scope.tableau = new Object();
	$scope.objFxn = new Array();
	$scope.goal;

	$scope.data = new Object();
	$scope.csv = "";

	$scope.minimize = function() {
		$scope.goal = true; //set if minimize button is clicked
		console.log($scope.goal);
	}

	$scope.maximize = function() {
		$scope.goal = false; //set if maximize button is clicked
		console.log($scope.goal);
	}

	$scope.convertToCSV = function() {
		var length = Object.keys($scope.data).length; //get length of object data
	}

}]);