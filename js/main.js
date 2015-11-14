$(document).ready(function(){

	$(".button-collapse").sideNav({
		menuWidth: 500,
		edge: 'right'
	});

	$("#element-panel").hover(function(){
		$(".element-details").slideDown("slow");
	});

	$("#station-panel").hover(function(){
		$(".element-details").slideUp("slow");
	});

});