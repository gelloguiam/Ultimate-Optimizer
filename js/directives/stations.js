ulopt.directive('stations', function(){
	return {
		restrict : 'E',
		scope : {
			station: '='
		},
		templateUrl: 'template/stations.html'
	}
});