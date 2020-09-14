<?php

/* DATABASE CONNECTION */

//$me_dbcon = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
$me_dbcon = mysqli_connect('127.0.0.1', 'root', '', 'test');

if ( ! $me_dbcon ) {
	echo 'DATABASE CONNECTION FAILED';
}


/* SELECT MARKERS */

$me_result = mysqli_query( $me_dbcon, "SELECT * FROM `marker_locations`" );


$MARKERS = Array();

while ( $me_row = mysqli_fetch_assoc($me_result) ) {
	$MARKERS[] = $me_row;
}

?>


<script>

var MARKERS = <?php

	/* OUTPUT MARKER DATA IN JSON FORMAT */

	echo json_encode( $MARKERS );

?>;


var EARTH_SCRIPT_URL = "miniature.earth.js";


/* load earth.js after the page is loaded. */

window.addEventListener( 'load', function() {
	var script = document.createElement( "script" );
	script.src = EARTH_SCRIPT_URL;
	document.body.appendChild( script );	
} );


window.addEventListener( "earthjsload", function() {

	/* setup earth */
	
	var myearth = new Earth( "myearth", {
		location: { lat: 10, lng: -80 },
		zoom: 1.2,
		
		/* more earth options here */
	} );
	
	myearth.addEventListener( "ready", function() {
	
		for ( var i=0; i < MARKERS.length; i++ ) {

			var marker = this.addMarker( {
				mesh : "Pin3",
				color: 'blue',
				location : { lat: Number(MARKERS[i].lat), lng: Number(MARKERS[i].lng) },
				scale: 0.5,
				hotspotHeight: 0.25,
				hotspotRadius: 1.5,
				title: MARKERS[i].title, /* custom property */
			} );
			
			// title tooltip
			if ( marker.title ) {
				marker.addEventListener( 'mouseover', showTitleOverlay );
				marker.addEventListener( 'mouseout', hideTitleOverlay );
			}

		}
		
	} );
	
} );


// handle overlays

function showTitleOverlay() {
	
	// create an overlay for the markers on this earth on first use
	
	if ( ! this.earth.myOverlay ) {
		this.earth.myOverlay = this.earth.addOverlay();
	}
	
	this.earth.myOverlay.zoomScale = 0;
	this.earth.myOverlay.content = this.title;
	this.earth.myOverlay.location = this.location;
	this.earth.myOverlay.visible = true;	
	
}

function hideTitleOverlay() {
	
	if ( this.earth.myOverlay ) this.earth.myOverlay.visible = false; 
	
}


</script>

<style>

.earth-overlay {
	background-color: white;
	box-shadow: 0 2px 8px black;
	border-radius: 0px 12px 12px 12px;
	padding: 0.25em 0.5em;
}

.earth-container {
	margin: 0 auto;
	max-width: 600px;
}

</style>


<h2 style="margin-top: 2em; text-align: center">PHP EXAMPLE, LOCATIONS FROM MYSQL DATABASE</h2>

<div id="myearth" class="earth-container"></div>