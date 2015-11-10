var ulopt = angular.module('ultimateOptimizer', []);

ulopt.controller('MainController', ['$scope', function($scope){
	$scope.data = {};
	$scope.save = function(data){
		$scope.data = angular.copy(data);
	}
}]);