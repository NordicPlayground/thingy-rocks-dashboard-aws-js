
WORDPRESS PLUGIN EXAMPLE

This plugin helps you to integrate Miniature Earth into a Wordpress website.


1.	Upload this directory into your wp-content/plugins directory and activate the plugin.


2.	Add an earth to a post or page by Shorttag or directly as HTML code:

	Shorttag (add as block or paste into Classic Editor):

	[earth id="myearth" class="mycustomclass" lat="40.7" lng="-74.1" land="#EEE"]
		[marker lat="40.7" lng="-74.1" color="#0000FF" title="New York"]
		[marker lat="35.6" lng="139.7" color="#FF0000" title="Tokyo"]
		[marker lat="52.5" lng="13.40" color="#00FF00" title="Berlin"]
	[/earth]
	
	-- or --

	HTML (add as block):

	<div id="myearth" class="earth-container mycustomclass" data-lat="40.7" data-lng="-74.1" data-land="#EEE">
		<div class="earth-marker" data-lat="40.7" data-lng="-74.1" data-color="#0000FF" data-title="New York"></div>
		<div class="earth-marker" data-lat="35.6" data-lng="139.7" data-color="#FF0000" data-title="Tokyo"></div>
		<div class="earth-marker" data-lat="52.5" data-lng="13.40" data-color="#00FF00" data-title="Berlin"></div>
	</div>
	
	
3.	Modify myearth.js and myearth.css and add the properties, behavior and styles you need.
