<?php
/*
Plugin Name: Miniature Earth Loader
Plugin URI: https://miniature.earth
Version: 1.0
Author: Miniature Earth
*/


if( ! defined('ABSPATH') ) exit;

if ( ! class_exists('MiniatureEarthLoader') ) :

	class MiniatureEarthLoader {
		
		
		function __construct() {
			
			add_action('wp_enqueue_scripts', array($this, 'enqueue'));
			
			add_shortcode('earth',  array($this, 'shortcode_earth'));
			add_shortcode('marker',  array($this, 'shortcode_marker'));
			
		}
				
		

		/* enqueue scripts and styles */
		 
		function enqueue() {

			wp_enqueue_script(
				'earth-loader-script',
				plugin_dir_url(__FILE__) . 'miniature.earth.loader.js',
				array(),
				'1.0'
			);
			
			wp_enqueue_script(
				'myearth-script',
				plugin_dir_url(__FILE__) . 'myearth.js',
				array('earth-loader-script'),
				filemtime(__DIR__ . '/myearth.js')
			);
			
			wp_enqueue_style(
				'myearth-style',
				plugin_dir_url(__FILE__) . 'myearth.css',
				array(),
				filemtime(__DIR__ . '/myearth.css')
			);

		}
		
		
		
		/* short codes */
		
		function shortcode_earth($attr, $content="") {
			
			// append custom classes to class attribute
			$classes = 'earth-container';
			if ( ! empty($attr['class']) ) $classes .= ' ' . $attr['class'];
			
			// construct html code
			$html = '<div class="' . $classes . '"';

			// element id
			if ( ! empty($attr['id']) ) $html .= ' id="'. $attr['id'] .'"';

			// add custom data parameters
			foreach ( $attr as $name => $value ) {
				if ( $name === 'id' || $name === 'class' ) continue;
				$html .= ' data-' . $name . '="' . esc_attr($value) . '"';
			}
			
			$html .= '>' . do_shortcode($content) . '</div>';
			
			return $html;
			
		}
		
		
		function shortcode_marker($attr) {
			
			// construct html code
			$html = '<div class="earth-marker"';
			
			// add custom data parameters
			foreach ( $attr as $name => $value ) {
				$html .= ' data-' . $name . '="' . esc_attr($value) . '"';
			}
			
			$html .= '></div>';
			
			return $html;
			
		}
		
		
	}

	
	// init
	new MiniatureEarthLoader();

endif;
