ulopt.directive('components', function() {
	return {
		restrict : 'EA',
		scope : {
			item: '=',
			status: '='
		},
		templateUrl: 'template/components.html'
	}
});