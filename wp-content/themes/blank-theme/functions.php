<?php
/**
 * Blank Theme functions.
 *
 * @package blank-theme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue theme stylesheet on frontend and in the block editor.
 */
function blank_theme_styles(): void {
	wp_enqueue_style(
		'blank-theme-style',
		get_stylesheet_uri(),
		[],
		wp_get_theme()->get( 'Version' )
	);
}
add_action( 'wp_enqueue_scripts', 'blank_theme_styles' );
add_action( 'enqueue_block_editor_assets', 'blank_theme_styles' );
