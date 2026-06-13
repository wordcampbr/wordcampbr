<?php
/**
 * Plugin Name: WordCamp.org
 * Plugin URI:  https://github.com/wordcampbr/wordcampbr
 * Description: Core functionality for WordCamp Brasil sites — blocks, REST endpoints, and site setup helpers.
 * Version:     0.1.0
 * Requires at least: 6.7
 * Requires PHP: 7.4
 * Tested up to: 7.0
 * Author:      WordCamp Brasil
 * Author URI:  https://brasil.wordcamp.org
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: wordcamp-org
 * Domain Path: /languages
 *
 * @package wordcamp-org
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'WORDCAMP_ORG_VERSION', '0.1.0' );
define( 'WORDCAMP_ORG_DIR', plugin_dir_path( __FILE__ ) );
define( 'WORDCAMP_ORG_URL', plugin_dir_url( __FILE__ ) );

/**
 * Load plugin text domain.
 */
function wordcamp_org_load_textdomain(): void {
	load_plugin_textdomain(
		'wordcamp-org',
		false,
		dirname( plugin_basename( __FILE__ ) ) . '/languages'
	);
}
add_action( 'plugins_loaded', 'wordcamp_org_load_textdomain' );

// ---------------------------------------------------------------------------
// Future includes (uncomment as features are added):
// ---------------------------------------------------------------------------
// require_once WORDCAMP_ORG_DIR . 'includes/blocks.php';
// require_once WORDCAMP_ORG_DIR . 'includes/rest-api.php';
// require_once WORDCAMP_ORG_DIR . 'includes/setup.php';
