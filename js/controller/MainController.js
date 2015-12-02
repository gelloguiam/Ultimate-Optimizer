ulopt.controller('MainController', function($scope, $http) {
	$scope.components = null;
	$scope.componentsStatus = [true, true, true, true, true, true];

	$scope.stations = null;
	$scope.stationsStatus = [false, false, false, false, false, false, false, false, false, false, false];

	$scope.tableaumin = [];
	$scope.tableau = [];
	$scope.activeStationCount = 0;

	$scope.activeMonth = "March";
	$scope.monthIndex = 0;

	$scope.objectiveFunction = "";
	$scope.constraintsSet = "";

	$scope.activeElementIndex = 0;
	$scope.activeElement = "Arsenic";
	$scope.activeElementUpdate = [];

	$scope.totalVolume = 0;
	$scope.resultMAX = "";
	$scope.resultMIN = "";
	$scope.resultMatrix = "";

	/* INITIALIZE DATA */
	//loads components data
	$http.get("data/components.json").success(function(response){
		$scope.components = response;
	});

	//loads water station data
	$http.get("data/riverstations.json").success(function(response){
		$scope.stations = response;
	});

	$scope.loadResult = function(callback){
		$scope.resultMAX = "";
		$scope.resultMIN = "";
		$scope.resultMatrix = "";

		$http.get("iterations/max_iteration_6.csv").then(function(response){
			var dummy = response.data.split("\n");
			for(var i=0; i<dummy.length; i++) {
				dummy[i] = dummy[i].split(",");				
			}
			$scope.resultMAX = dummy;
		});		
		$http.get("iterations/min_iteration_6.csv").then(function(response){
			var dummy = response.data.split("\n");
			for(var i=0; i<dummy.length; i++) {
				dummy[i] = dummy[i].split(",");				
			}
			$scope.resultMIN = dummy;
			callback();
		});
	}

	$scope.showResult = function() {
		$scope.loadResult(function(){
			var table = [];
			var dummy = [];
			var col = 13;
			for(var i=0; i<6; i++) { //min iterations
				console.log($scope.resultMIN[i]);
				dummy.push($scope.resultMIN[i][13]);
				dummy.push($scope.resultMAX[i][13]);
				dummy.push($scope.resultMIN[i][13] * $scope.components.components[i].remCost);
				dummy.push($scope.resultMAX[i][13] * $scope.components.components[i].remCost);
				dummy.push($scope.totalVolume *
					$scope.resultMIN[i][13] *
					($scope.components.components[i].remAmt / 1000000));
				dummy.push($scope.totalVolume *
					$scope.resultMAX[i][13] *
					($scope.components.components[i].remAmt / 1000000));
				table.push(dummy);
				var dummy = [];
			}

			$scope.resultMatrix = table;
			$("#hover-panel").slideDown();
		});
	}


	/* Toggle Station */
	$scope.toggleStation = function(index) {
		var volume = parseInt($scope.stations.stations[index].volume);
		if($scope.stationsStatus[index]) {
			$scope.stationsStatus[index] = false;
			$scope.activeStationCount--;
			$scope.totalVolume -= volume;
		}

		else {
			$scope.stationsStatus[index] = true;
			$scope.activeStationCount++;		
			$scope.totalVolume += volume;
		}

		var element = $("stations .station").get(index);
		$(element).toggleClass("station-element-active");
	}

	$scope.toggleAllStation = function(status) {
		var element;
		var volume;
		if(status) $scope.activeStationCount = 11;
		else $scope.activeStationCount = 0;

		$scope.totalVolume = 0;

		for (var i=0; i<12; i++) {
			element = $("stations .station").get(i);
			if(status) {
				$scope.stationsStatus[i] = true;
				$(element).addClass("station-element-active");
				volume = parseInt($scope.stations.stations[i].volume);
				$scope.totalVolume += volume;
			}
			else {
				$scope.stationsStatus[i] = false;
				$(element).removeClass("station-element-active");				
			}			
		}		
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
		
		return dummy; //return array of column header
	}

	/* RIVER QUALITY COST PROJECTOR MATRIX (ROUND 2) */
	$scope.getSumRQCinRMS = function(goal) {
		/* goal = true; minimize
		   goal = false; maximize */
		var dummy = [];
		var table = [];
		var RMSName = "";
		var RQCData = [];
		var summ = 0;

		//traverse all components
		for(var index=0; index<6; index++) {
			//get contents of componets[index]
			RQCData = $scope.components.components[index];

			for(var i=0; i<6; i++) {
				if(i == index) dummy.push(RQCData.remAmt * $scope.activeStationCount);
				else dummy.push(0);
			}

			//fill in slack variables
			for(var i=0; i<6; i++) {
				if(i == index) dummy.push(1);
				else dummy.push(0);
			}
			
			//traverse river stations within components
			for(var j=0; j<11; j++) {
				if($scope.stationsStatus[j]) {
					//set River Monitoring System Name
					RMSName = $scope.stations.stations[j].name;
					//summation of 
					summ = summ + parseFloat(RQCData[RMSName][$scope.monthIndex]);
				}
			}


			//check if minimize or maximize
			if(!goal) summ = summ + parseFloat(RQCData.maxStand * $scope.activeStationCount);	
			else summ = summ + parseFloat(RQCData.minStand * $scope.activeStationCount);				


			dummy.push(0); // column Z
			dummy.push(summ); // column RHS
			table.push(dummy);

			dummy = [];
			summ = 0;
		}
		
		return table;			
	}

	/* RIVER QUALITY COST PROJECTOR MATRIX (ROUND 1)*/
	$scope.constructMatrix = function(goal) {
		var table = [];
		var dummy = [];
		var constraints = $scope.getSumRQCinRMS(goal);
		table.push($scope.setHeaderMatrix()); //construct column heads
		
		for(var i=0; i<constraints.length; i++) {
			table.push(constraints[i]); //construct constraints
		}

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

		table.push(dummy);
		return table;
	}


	/* EXPORT INITIAL TABLEAU */
	$scope.exportData = function(){
		//source: http://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
		if($scope.activeStationCount == 0) {
 			Materialize.toast('NO RMS SELECTED!', 4000) 
 			return;
		}

		var datamin = $scope.constructMatrix(true);
		var datamax = $scope.constructMatrix(false);

		//export minimization data
		var csvContent = "data:text/csv;charset=utf-8,";
		
		datamin.forEach(function(infoArray, index){
	   		dataString = infoArray.join(",");
	   		csvContent += index < datamin.length ? dataString+ "\n" : dataString;

		});

		var encodedUri = encodeURI(csvContent);
		var link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "datamin.csv");
		link.click();


		//export maximization data
		var csvContent = "data:text/csv;charset=utf-8,";
		
		datamax.forEach(function(infoArray, index){
	   		dataString = infoArray.join(",");
	   		csvContent += index < datamax.length ? dataString+ "\n" : dataString;

		});

		var encodedUri = encodeURI(csvContent);
		var link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "datamax.csv");
		link.click();
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


	$scope.exportUltimateOptimizer = function(goal) {
		/* goal = true MINIMIZE
		   goal = false MAXIMIZE */
		var csvContent = "data:text/csv;charset=utf-8,";
		var data = $scope.objectiveFunction;
		var constraints = $scope.constraintsSet;

		//split constraints per line
		constraints = constraints.split("\n");
		csvContent += constraints.length + "\n";

		if(goal) csvContent+="minimize\n";
		else csvContent +="maximize\n";

		csvContent += data + "\n";

		for(var i=0; i<constraints.length; i++) {
			csvContent += constraints[i] + "\n";
		}

		var encodedUri = encodeURI(csvContent);
		var link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "data.txt");
		link.click();
	}

});