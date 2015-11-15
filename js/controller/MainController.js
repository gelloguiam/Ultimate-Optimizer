ulopt.controller('MainController', function($scope, $http){
	$scope.components = null;
	$scope.componentsStatus = [false, false, false, false, false, false];
	$scope.stationsStatus = [false, false, false, false, false, false, false, false, false, false, false];

	$scope.stations = null;
	$scope.goal = null;
	$scope.month = "June";

	$scope.activeComponets = [];

	//loads components data
	$http.get("data/components.json").success(function(response){
		$scope.components = response;
	});

	//loads water station data
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

	$scope.toggleComponent = function(index) {
		if($scope.componentsStatus[index]) $scope.componentsStatus[index] = false;	
		else $scope.componentsStatus[index] = true;
		console.log($scope.componentsStatus);
	}

	$scope.toggleStation = function(index) {
		if($scope.stationsStatus[index]) $scope.stationsStatus[index] = false;	
		else $scope.stationsStatus[index] = true;
		console.log($scope.stationsStatus);
	}

	$scope.getActiveComponets = function(){
		$scope.activeComponets = [];
		var length = $scope.components.components.length;
		for (var i=0; i<length; i++) {
			if($scope.componentsStatus[i]) {
				$scope.activeComponets.push($scope.components.components[i].name);
			}
		}
	}

	$scope.getActiveStation = function(){
		$scope.activeStations = [];
		var length = $scope.stations.stations.length;
		for (var i=0; i<length; i++) {
			if($scope.stationsStatus[i]) {
				$scope.activeStations.push($scope.stations.stations[i].name);
			}
		}
	}

	$scope.updateStatus = function(){
		$scope.getActiveStation();
		$scope.getActiveComponets();

		console.log("Components: " + $scope.activeComponets + "\n");
		console.log("Stations: " + $scope.activeStations + "\n");

	}

});


