var ulopt = angular.module('ultimateOptimizer', []);

ulopt.controller('MainController', function($scope){
	$scope.contents = null;

	$scope.loadData = function() {
		$.getJSON("json/data.json", function(data){
			$scope.contents = data;
			console.log(data);
			alert("HEHE");
		});
	}


});


