ulopt.directive('components', function() {
	return {
		restrict : 'EA',
		scope : {
			item: '=',
			index: '=',
			focus: '='
		},
		templateUrl: 'template/components.html'
	}
});