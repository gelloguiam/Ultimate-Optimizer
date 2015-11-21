ulopt.controller('MainController', function($scope, $http) {
	$scope.tableau = [];

	$scope.components = null;
	$scope.stations = null;
	$scope.goal = null;
	$scope.month = null;

	$scope.componentsStatus = [false, false, false, false, false, false];
	$scope.stationsStatus = [false, false, false, false, false, false, false, false, false, false, false];
	$scope.monthIndex = 0;

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

		var element = $("stations .station").get(index);
		$(element).toggleClass("station-element-active");
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

	$scope.setMonth = function(index) {
		var element = $(".month-panel").get(index);
		$(element).toggleClass("active-month");
		$scope.month = $scope.stations.months[index];
	}

	$scope.updateStatus = function(){
		$scope.getActiveStation();
		$scope.getActiveComponets();
	}

	$scope.setHeaderMatrix = function(){
		var dummy = [];
		var text = "";

		for(var i=0; i<6; i++) {
			text = "x" + (i+1);
			dummy.push(text);
		}

		for(var i=0; i<6; i++) {
			text = "s" + (i+1);
			dummy.push(text);
		}

		dummy.push("Z");
		dummy.push("RHS");

		$scope.tableau.push(dummy);

	}

	$scope.getSumRQCinRMS = function() {
		var dummy = [];
		var RMSName = "";
		var RQCData = [];
		var n = 0;	
		var summ = 0;

		$scope.stationsStatus.forEach(function(status, index){
			if(status) n++;
		});

		$scope.componentsStatus.forEach(function(RQC, indexOuter){	
			
			if(RQC) {
				//get contents of componets[index]
				RQCData = $scope.components.components[indexOuter];

				for(var i=0; i<6; i++) {
					if(i==indexOuter) dummy.push(RQCData.remAmt);
					else dummy.push(0);

				}
				
				$scope.stationsStatus.forEach(function(RMS, indexInner){
					if(RMS) {
						//set River Monitoring System Name
						RMSName = $scope.stations.stations[indexInner].name;
						summ = summ + parseFloat(RQCData[RMSName][$scope.monthIndex]);
					}
				});
				
				//fill in slack variables
				for(var i=0; i<6; i++) {
					if(i==indexOuter) dummy.push(1);
					else dummy.push(0);
				}

				summ = summ + parseFloat(RQCData.maxStand * n);
				dummy.push(0); // column Z
				dummy.push(summ); // column RHS

			}
			//add to array if not empty
			if(dummy.length > 0) $scope.tableau.push(dummy);
			dummy = [];
			summ = 0;
		});
	}

	$scope.constructMatrix = function() {
		var dummy = [];
		$scope.setHeaderMatrix();
		$scope.getSumRQCinRMS();
		
		//construct objective function
		$scope.componentsStatus.forEach(function(content, index){
			if(content) {
				dummy.push(-1 * $scope.components.components[index].remCost);
			}
		});

		//fill in slack variables
		for(var i=0; i<6; i++) {
			dummy.push(0);
		}

		dummy.push(1); //TC
		dummy.push(0); //solution for objective function

		$scope.tableau.push(dummy);

	}

	$scope.exportData = function(){
		//source: http://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
		$scope.constructMatrix();
		var data = $scope.tableau;
		var csvContent = "data:text/csv;charset=utf-8,";
		
		data.forEach(function(infoArray, index){

	   		dataString = infoArray.join(",");
	   		csvContent += index < data.length ? dataString+ "\n" : dataString;

		});

		var encodedUri = encodeURI(csvContent);
		var link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "data.csv");

		link.click();
	}

});