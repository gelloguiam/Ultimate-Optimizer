ulopt.controller('MainController', function($scope, $http) {
	$scope.components = null;

	$scope.stations = null;
	$scope.stationsStatus = [false, false, false, false, false, false, false, false, false, false, false];

	$scope.tableau = [];
	$scope.activeStationCount = 0;

	$scope.activeMonth = "March";
	$scope.monthIndex = 0;

	$scope.objectiveFunction = "";
	$scope.constraintsSet = "";

	$scope.activeElementIndex = 0;
	$scope.activeElement = "Arsenic";
	$scope.activeElementUpdate = [];
	


	/* INITIALIZE DATA */
	//loads components data
	$http.get("data/components.json").success(function(response){
		$scope.components = response;
	});

	//loads water station data
	$http.get("data/riverstations.json").success(function(response){
		$scope.stations = response;
	});

	/* Toggle Station */
	$scope.toggleStation = function(index) {
		if($scope.stationsStatus[index]) {
			$scope.stationsStatus[index] = false;
			$scope.activeStationCount--;
		}

		else {
			$scope.stationsStatus[index] = true;
			$scope.activeStationCount++;		
		}

		var element = $("stations .station").get(index);
		$(element).toggleClass("station-element-active");
	}

	$scope.setMonth = function(index) {
		$scope.activeMonth = $scope.stations.months[index];
		$scope.monthIndex = index;
	}


	/* RIVER QUALITY COST PROJECTOR MATRIX (ROUND 3) */
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

	/* RIVER QUALITY COST PROJECTOR MATRIX (ROUND 2) */
	$scope.getSumRQCinRMS = function() {
		var dummy = [];
		var RMSName = "";
		var RQCData = [];
		var summ = 0;

		$scope.componentsStatus.forEach(function(RQC, indexOuter){	
			//get contents of componets[index]
			RQCData = $scope.components.components[indexOuter];

			for(var i=0; i<6; i++) {
				if(i==indexOuter) dummy.push(RQCData.remAmt * $scope.activeStationCount);
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
				summ = summ + parseFloat(RQCData.maxStand * $scope.activeStationCount);				
			else
				summ = summ + parseFloat(RQCData.minStand * $scope.activeStationCount);				

			dummy.push(0); // column Z
			dummy.push(summ); // column RHS
			
			//add to array if not empty
			if(dummy.length > 0) $scope.tableau.push(dummy);
			dummy = [];
			summ = 0;
		});
	}

	/* RIVER QUALITY COST PROJECTOR MATRIX (ROUND 1)*/
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


	/* EXPORT INITIAL TABLEAU */
	$scope.exportData = function(){
		//source: http://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
		if($scope.activeStationCount == 0) {
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

	/* Toggle Site Tab */
	$scope.toggleTab = function(index){
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
	}


	$scope.doSimplex = function(goal) {
		/* goal == 0 minimize
		   goal == 1 maximize */
	}

	$scope.focusComponent = function(index) {
		var elements = [];
		
		for(var i=0; i<6; i++) {
			elements.push($("components .card").get(i));
			if(i!= index)
			$(elements[i]).removeClass("activeElement");
		}
		$(elements[index]).addClass("activeElement");

		$scope.activeElementIndex = index;
		$scope.activeElement = $scope.components.components[index].name;
	}

	$scope.updateElement = function() {	
		$scope.components.components[$scope.activeElementIndex].remCost = $scope.activeElementUpdate[0];
		$scope.components.components[$scope.activeElementIndex].remAmt = $scope.activeElementUpdate[1];
		$scope.components.components[$scope.activeElementIndex].minStand = $scope.activeElementUpdate[2];
		$scope.components.components[$scope.activeElementIndex].maxStand = $scope.activeElementUpdate[3];
	}

});