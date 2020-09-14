
window.addEventListener( "earthjsload", function() {

	document.querySelectorAll('.earth-container').forEach( function(container) {
		
		
		// set earth options
		
		var earth_options = {
			
			location: {
				lat: Number(container.dataset.lat) || 0,
				lng: Number(container.dataset.lng) || 0,
			},
			
			// define options from data parameters or based on id/classes
			
			mapLandColor : container.dataset.land || '#EEE',
			
		};
		
		

		// create earth
		
		var earth = new Earth( container, earth_options );
		
		
		
		// add markers when ready
		
		earth.addEventListener( 'ready', function() {
			
			var earth = this;
			
		
			earth.element.querySelectorAll('.earth-marker').forEach( function(element) {
				
				// set marker options
				
				var marker_options = {
					
					mesh : 'Pin3',
					hotspotHeight: 0.2,
					
					location: {
						lat: Number(element.dataset.lat) || 0,
						lng: Number(element.dataset.lng) || 0,
					},
					
					color: element.dataset.color || '#FF0000',
					scale: Number(element.dataset.scale) || 1.5,

					// apply options from parameters
						
					data : element.dataset // reference to the complete dataset
					
				};
			
				var marker = earth.addMarker( marker_options );
				
				// link
				if ( element.dataset.link ) {
					marker.addEventListener( 'click', function() {
						window.open( this.data.link );
					} );
				}
				
				// title tooltip
				if ( element.dataset.title ) {
					marker.addEventListener( 'mouseover', showTitleOverlay );
					marker.addEventListener( 'mouseout', hideTitleOverlay );
				}
			
			} ); // forEach .earth-marker
			
			
		} ); // ready event
		
		
	} ); // forEach .earth-container
	
} ); // earthjsload event



// handle overlays

function showTitleOverlay() {
	
	// create an overlay for the markers on this earth on first use
	
	if ( ! this.earth.myOverlay ) {
		this.earth.myOverlay = this.earth.addOverlay( {
			transform: ''
		} );
	}
	
	this.earth.myOverlay.content = this.data.title;
	this.earth.myOverlay.location = this.location;
	this.earth.myOverlay.visible = true;	
	
}

function hideTitleOverlay() {
	
	if ( this.earth.myOverlay ) this.earth.myOverlay.visible = false; 
	
}
