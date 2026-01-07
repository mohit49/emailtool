<?php
/**
 * Uninstall script for Przio Popup plugin
 * 
 * This file is executed when the plugin is uninstalled.
 * It removes all plugin options from the database.
 * 
 * @package Przio_Popup
 */

// Exit if uninstall not called from WordPress
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Delete plugin options
delete_option('przio_popup_project_id');
delete_option('przio_popup_sdk_url');
delete_option('przio_popup_enable_debug');

// Delete site options in multisite
if (is_multisite()) {
    global $wpdb;
    $blog_ids = $wpdb->get_col("SELECT blog_id FROM $wpdb->blogs");
    
    foreach ($blog_ids as $blog_id) {
        switch_to_blog($blog_id);
        delete_option('przio_popup_project_id');
        delete_option('przio_popup_sdk_url');
        delete_option('przio_popup_enable_debug');
        restore_current_blog();
    }
}

