
/* load miniature.earth.js after the page is loaded only if needed */

window.addEventListener( 'load', function() {
	
	// return if there is no earth on this page
	if ( ! document.querySelector('.earth-container') ) return;
	
	// get puglin directory url
	var script_element = document.querySelector('script[src*="miniature.earth.loader.js"]');
	
	if (script_element) {
		var plugin_dir_url = script_element.getAttribute('src').split('miniature.earth.loader.js')[0];
		
	} else {
		var plugin_dir_url = document.querySelector('head').innerHTML.match(/https?:\/\/.+?\/wp-content\//)[0] + 'plugins/wordpress-miniature-earth/';
		
	}
	
	// load script
	var script = document.createElement( "script" );
	script.src = plugin_dir_url + "miniature.earth.js";
	document.body.appendChild( script );
	
} );
