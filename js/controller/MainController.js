ulopt.controller('MainController', function($scope, $http) {
	$scope.title = "Ultimate Optimizer"
	$scope.components = null;
	$scope.stations = null;

	$scope.tableau = [];
	$scope.toggledStationCount = 0;

	$scope.goal = null;
	$scope.month = "March";
	$scope.monthIndex = 0;

	$scope.componentsStatus = [true, true, true, true, true, true];
	$scope.stationsStatus = [false, false, false, false, false, false, false, false, false, false, false];

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

	$scope.toggleStation = function(index) {
		if($scope.stationsStatus[index]) {
			$scope.stationsStatus[index] = false;
			$scope.toggledStationCount--;
		}

		else {
			$scope.stationsStatus[index] = true;
			$scope.toggledStationCount++;		
		}

		var element = $("stations .station").get(index);
		$(element).toggleClass("station-element-active");
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
		$scope.month = $scope.stations.months[index];
		$scope.monthIndex = index;
	}

	$scope.updateStatus = function(){
		$scope.getActiveStation();
	}

	$scope.setHeaderMatrix = function(){
		var dummy = [];
		var text = "";

		for(var i=0; i<6; i++) { //set variable headers
			text = "x" + (i+1);
			dummy.push(text);
		}

		for(var i=0; i<6; i++) { //set slack variable headers
			text = "s" + (i+1);
			dummy.push(text);
		}

		dummy.push("Z"); //header for column Z
		dummy.push("RHS"); //header for solution column
		$scope.tableau.push(dummy);
	}

	$scope.getSumRQCinRMS = function() {
		var dummy = [];
		var RMSName = "";
		var RQCData = [];
		var summ = 0;

		$scope.componentsStatus.forEach(function(RQC, indexOuter){	
			//get contents of componets[index]
			RQCData = $scope.components.components[indexOuter];

			for(var i=0; i<6; i++) {
				if(i==indexOuter) dummy.push(RQCData.remAmt * $scope.toggledStationCount);
				else dummy.push(0);
			}
				
			//traverse river stations within components
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

			//check if minimize or maximize
			if($scope.goal == "Maximize")
				summ = summ + parseFloat(RQCData.maxStand * $scope.toggledStationCount);				
			else
				summ = summ + parseFloat(RQCData.minStand * $scope.toggledStationCount);				

			dummy.push(0); // column Z
			dummy.push(summ); // column RHS
			
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
			dummy.push(-1 * $scope.components.components[index].remCost);
		});

		//fill in slack variables
		for(var i=0; i<6; i++) {
			dummy.push(0);
		}

		dummy.push(1); //TC
		dummy.push(0); //solution for objective function

		$scope.tableau.push(dummy);
	}

	$scope.resetData = function() {
		$scope.tableau = [];
		$scope.toggledStationCount = 0;
		$scope.goal = null;

		$scope.componentsStatus = [true, true, true, true, true, true];
		$scope.stationsStatus = [false, false, false, false, false, false, false, false, false, false, false];

		for(var i=0; i<11; i++) {
			var element = $("stations .station").get(i);
			$(element).removeClass("station-element-active");			
		}

	}

	$scope.loadResults = function(){
		//loads results csv
		$http.get("iterations/iteration_6.csv").success(function(response){
			console.log(response.length);
		});

	}

	$scope.exportData = function(){
		//source: http://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
		if($scope.toggledStationCount == 0) {
 			Materialize.toast('NO RMS SELECTED!', 4000) 
 			return;
		}

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
		$scope.resetData();
	}

	$scope.slideTab = function(index){
		var tabs = [];

		for(var i=0; i<3; i++) {
			tabs.push($(".tab-content").get(i));
			if(index == i) {
				$(tabs[i]).show();
			}
			else {
				$(tabs[i]).hide();
			}
		}

		console.log(index);
	}

});