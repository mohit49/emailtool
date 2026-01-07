<?php
/**
 * Plugin Name: Przio Popup
 * Plugin URI: https://przio.com/wordpress-plugin
 * Description: Easily integrate Przio popups into your WordPress site. Add your project ID and the SDK will automatically inject popups based on your settings.
 * Version: 1.1.0
 * Author: Przio
 * Author URI: https://przio.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: przio-popup
 * Requires at least: 5.0
 * Tested up to: 6.9
 * Requires PHP: 7.2
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('PRZIO_POPUP_VERSION', '1.1.0');
define('PRZIO_POPUP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PRZIO_POPUP_PLUGIN_URL', plugin_dir_url(__FILE__));
define('PRZIO_POPUP_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main Przio Popup Plugin Class
 */
class Przio_Popup {
    
    /**
     * Instance of this class
     */
    private static $instance = null;
    
    /**
     * Get instance of this class
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
    }
    
    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Admin hooks
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_styles'));
        
        // Frontend hooks
        add_action('wp_footer', array($this, 'inject_sdk_script'));
        
        // Plugin action links
        add_filter('plugin_action_links_' . PRZIO_POPUP_PLUGIN_BASENAME, array($this, 'add_plugin_action_links'));
    }
    
    /**
     * Enqueue admin styles
     */
    public function enqueue_admin_styles($hook) {
        // Only load on our settings page
        if ('settings_page_przio-popup' !== $hook) {
            return;
        }
        
        wp_add_inline_style('wp-admin', $this->get_admin_css());
    }
    
    /**
     * Get admin CSS
     */
    private function get_admin_css() {
        return '
            .przio-popup-info {
                margin-top: 30px;
                padding: 20px;
                background: #f0f0f1;
                border-left: 4px solid #2271b1;
                border-radius: 4px;
            }
            .przio-popup-info h2 {
                margin-top: 0;
                color: #1d2327;
            }
            .przio-popup-info h3 {
                margin-top: 20px;
                color: #1d2327;
            }
            .przio-popup-info h4 {
                margin-top: 0;
                color: #1d2327;
            }
            .przio-popup-info ol,
            .przio-popup-info ul {
                margin-left: 20px;
            }
            .przio-popup-info code {
                background: #f0f0f1;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: Consolas, Monaco, monospace;
            }
            .przio-popup-info .status-active {
                color: #00a32a;
            }
            .przio-popup-info .status-incomplete {
                color: #d63638;
            }
        ';
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            __('Przio Popup Settings', 'przio-popup'),
            __('Przio Popup', 'przio-popup'),
            'manage_options',
            'przio-popup',
            array($this, 'render_settings_page')
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('przio_popup_settings', 'przio_popup_project_id', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => ''
        ));
        
        register_setting('przio_popup_settings', 'przio_popup_sdk_type', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => 'popup'
        ));
        
        register_setting('przio_popup_settings', 'przio_popup_enable_debug', array(
            'type' => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default' => false
        ));
        
        // Add settings sections
        add_settings_section(
            'przio_popup_main_section',
            __('Main Settings', 'przio-popup'),
            array($this, 'render_main_section_description'),
            'przio-popup'
        );
        
        // Add settings fields
        add_settings_field(
            'przio_popup_project_id',
            __('Project ID', 'przio-popup'),
            array($this, 'render_project_id_field'),
            'przio-popup',
            'przio_popup_main_section'
        );
        
        add_settings_field(
            'przio_popup_sdk_type',
            __('SDK Type', 'przio-popup'),
            array($this, 'render_sdk_type_field'),
            'przio-popup',
            'przio_popup_main_section'
        );
        
        add_settings_field(
            'przio_popup_enable_debug',
            __('Enable Debug Mode', 'przio-popup'),
            array($this, 'render_debug_field'),
            'przio-popup',
            'przio_popup_main_section'
        );
    }
    
    /**
     * Render main section description
     */
    public function render_main_section_description() {
        echo '<p>' . esc_html__('Configure your Przio popup integration. Enter your Project ID to get started.', 'przio-popup') . '</p>';
    }
    
    /**
     * Render project ID field
     */
    public function render_project_id_field() {
        $project_id = get_option('przio_popup_project_id', '');
        ?>
        <input type="text" 
               id="przio_popup_project_id" 
               name="przio_popup_project_id" 
               value="<?php echo esc_attr($project_id); ?>" 
               class="regular-text" 
               placeholder="<?php esc_attr_e('Enter your Project ID', 'przio-popup'); ?>" />
        <p class="description">
            <?php esc_html_e('Your Przio Project ID. You can find this in your Przio dashboard under Project Settings.', 'przio-popup'); ?>
        </p>
        <?php
    }
    
    /**
     * Render SDK type field
     */
    public function render_sdk_type_field() {
        $sdk_type = get_option('przio_popup_sdk_type', 'popup');
        ?>
        <select id="przio_popup_sdk_type" name="przio_popup_sdk_type" class="regular-text">
            <option value="popup" <?php selected($sdk_type, 'popup'); ?>>
                <?php esc_html_e('Popup SDK', 'przio-popup'); ?> (https://przio.com/sdk.js)
            </option>
            <option value="email" <?php selected($sdk_type, 'email'); ?>>
                <?php esc_html_e('Email SDK', 'przio-popup'); ?> (https://przio.com/sdk.js)
            </option>
        </select>
        <p class="description">
            <?php esc_html_e('Choose which Przio SDK to use. Popup SDK for popups and forms, Email SDK for sending emails programmatically.', 'przio-popup'); ?>
        </p>
        <?php
    }
    
    /**
     * Render debug field
     */
    public function render_debug_field() {
        $debug_enabled = get_option('przio_popup_enable_debug', false);
        ?>
        <label>
            <input type="checkbox" 
                   id="przio_popup_enable_debug" 
                   name="przio_popup_enable_debug" 
                   value="1" 
                   <?php checked($debug_enabled, true); ?> />
            <?php esc_html_e('Enable debug logging in browser console', 'przio-popup'); ?>
        </label>
        <p class="description">
            <?php esc_html_e('When enabled, the SDK will log detailed information to the browser console for troubleshooting.', 'przio-popup'); ?>
        </p>
        <?php
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Show success message
        if (isset($_GET['settings-updated'])) {
            add_settings_error(
                'przio_popup_messages',
                'przio_popup_message',
                __('Settings saved successfully!', 'przio-popup'),
                'success'
            );
        }
        
        settings_errors('przio_popup_messages');
        
        // Get logo URL - use absolute path from przio.com
        $logo_url = 'https://przio.com/assets/logo-web.png';
        ?>
        <div class="wrap">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                <img src="<?php echo esc_url($logo_url); ?>" alt="Przio Logo" style="width: 120px; height: auto; max-height: 48px;" />
                <h1 style="margin: 0;"><?php echo esc_html(get_admin_page_title()); ?></h1>
            </div>
            
            <form action="options.php" method="post">
                <?php
                settings_fields('przio_popup_settings');
                do_settings_sections('przio-popup');
                submit_button(__('Save Settings', 'przio-popup'));
                ?>
            </form>
            
            <?php
            $project_id = get_option('przio_popup_project_id', '');
            if (empty($project_id)) {
                ?>
                <div class="przio-popup-info" style="margin-top: 30px; padding: 20px; background: #f0f0f1; border-left: 4px solid #2271b1; border-radius: 4px;">
                    <h2 style="margin-top: 0;"><?php esc_html_e('Get Started with Przio', 'przio-popup'); ?></h2>
                    <p><?php esc_html_e('Follow these steps to set up Przio on your WordPress site:', 'przio-popup'); ?></p>
                    
                    <div style="margin-top: 20px; padding: 20px; background: #fff; border-radius: 4px; border: 2px solid #2271b1;">
                        <h3 style="margin-top: 0; color: #2271b1;"><?php esc_html_e('Step 1: Create Your Przio Account', 'przio-popup'); ?></h3>
                        <p><?php esc_html_e('If you don\'t have a Przio account yet, create one to get started:', 'przio-popup'); ?></p>
                        <a href="https://przio.com/signup" target="_blank" class="button button-primary" style="margin-top: 10px;">
                            <?php esc_html_e('Create Free Account', 'przio-popup'); ?> →
                        </a>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 20px; background: #fff; border-radius: 4px; border: 2px solid #2271b1;">
                        <h3 style="margin-top: 0; color: #2271b1;"><?php esc_html_e('Step 2: Create a Project', 'przio-popup'); ?></h3>
                        <p><?php esc_html_e('After signing up, create your first project:', 'przio-popup'); ?></p>
                        <ol style="margin-left: 20px;">
                            <li><?php esc_html_e('Log in to your Przio dashboard', 'przio-popup'); ?></li>
                            <li><?php esc_html_e('Click "Create New Project"', 'przio-popup'); ?></li>
                            <li><?php esc_html_e('Give your project a name', 'przio-popup'); ?></li>
                            <li><?php esc_html_e('Click "Create Project"', 'przio-popup'); ?></li>
                        </ol>
                        <a href="https://przio.com/projects" target="_blank" class="button button-secondary" style="margin-top: 10px;">
                            <?php esc_html_e('Go to Dashboard', 'przio-popup'); ?> →
                        </a>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 20px; background: #fff; border-radius: 4px; border: 2px solid #2271b1;">
                        <h3 style="margin-top: 0; color: #2271b1;"><?php esc_html_e('Step 3: Get Your Project ID', 'przio-popup'); ?></h3>
                        <p><?php esc_html_e('Copy your Project ID from the project settings:', 'przio-popup'); ?></p>
                        <ol style="margin-left: 20px;">
                            <li><?php esc_html_e('Open your project in Przio dashboard', 'przio-popup'); ?></li>
                            <li><?php esc_html_e('Go to Project Settings', 'przio-popup'); ?></li>
                            <li><?php esc_html_e('Copy the Project ID', 'przio-popup'); ?></li>
                            <li><?php esc_html_e('Paste it in the "Project ID" field above', 'przio-popup'); ?></li>
                        </ol>
                        <a href="https://przio.com/projects" target="_blank" class="button button-secondary" style="margin-top: 10px;">
                            <?php esc_html_e('Open Project Settings', 'przio-popup'); ?> →
                        </a>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 20px; background: #fff; border-radius: 4px; border: 2px solid #2271b1;">
                        <h3 style="margin-top: 0; color: #2271b1;"><?php esc_html_e('Step 4: Save Settings', 'przio-popup'); ?></h3>
                        <p><?php esc_html_e('Once you\'ve entered your Project ID above, click "Save Settings" to activate the plugin.', 'przio-popup'); ?></p>
                    </div>
                </div>
                <?php
            } else {
                ?>
                <div class="przio-popup-info" style="margin-top: 30px; padding: 20px; background: #f0f0f1; border-left: 4px solid #2271b1; border-radius: 4px;">
                    <h2 style="margin-top: 0;"><?php esc_html_e('How to Use', 'przio-popup'); ?></h2>
                    <ol>
                        <li><?php esc_html_e('Your Project ID is configured and active.', 'przio-popup'); ?></li>
                        <li><?php esc_html_e('Choose your SDK type (Popup or Email) above.', 'przio-popup'); ?></li>
                        <li><?php esc_html_e('The SDK script will automatically be injected into your site\'s footer.', 'przio-popup'); ?></li>
                    </ol>
                    
                    <h3 style="margin-top: 20px;"><?php esc_html_e('Need Help?', 'przio-popup'); ?></h3>
                    <p><?php esc_html_e('Visit our documentation or contact support:', 'przio-popup'); ?></p>
                    <a href="https://przio.com/docs" target="_blank" class="button button-secondary" style="margin-top: 10px;">
                        <?php esc_html_e('View Documentation', 'przio-popup'); ?> →
                    </a>
                </div>
                <?php
            }
            ?>
            
            <div class="przio-popup-info" style="margin-top: 30px; padding: 20px; background: #f0f0f1; border-left: 4px solid #2271b1; border-radius: 4px;">
                <h3 style="margin-top: 0;"><?php esc_html_e('Testing', 'przio-popup'); ?></h3>
                <p><?php esc_html_e('After saving your settings, visit your website and check the browser console (F12) to verify the SDK is loading correctly.', 'przio-popup'); ?></p>
                
                <?php
                if (!empty($project_id)) {
                    ?>
                    <div style="margin-top: 20px; padding: 15px; background: #fff; border-radius: 4px;">
                        <h4 style="margin-top: 0;"><?php esc_html_e('Current Configuration', 'przio-popup'); ?></h4>
                        <p><strong><?php esc_html_e('Project ID:', 'przio-popup'); ?></strong> <code><?php echo esc_html($project_id); ?></code></p>
                        <?php
                        $sdk_url = $this->get_sdk_url();
                        $sdk_type = get_option('przio_popup_sdk_type', 'popup');
                        ?>
                        <p><strong><?php esc_html_e('SDK Type:', 'przio-popup'); ?></strong> 
                            <?php echo $sdk_type === 'email' ? esc_html__('Email SDK', 'przio-popup') : esc_html__('Popup SDK', 'przio-popup'); ?>
                        </p>
                        <p><strong><?php esc_html_e('SDK URL:', 'przio-popup'); ?></strong> <code><?php echo esc_html($sdk_url); ?></code></p>
                        <p><strong><?php esc_html_e('Status:', 'przio-popup'); ?></strong> 
                            <span style="color: #00a32a;">✓ <?php esc_html_e('Active', 'przio-popup'); ?></span>
                        </p>
                    </div>
                    <?php
                }
                ?>
            </div>
        </div>
        <?php
    }
    
    /**
     * Get SDK URL
     */
    private function get_sdk_url() {
        $sdk_type = get_option('przio_popup_sdk_type', 'popup');
        
        // Both popup and email SDKs are now in the same file
        return 'https://przio.com/sdk.js';
    }
    
    /**
     * Inject SDK script into footer
     */
    public function inject_sdk_script() {
        $project_id = get_option('przio_popup_project_id', '');
        
        // Don't inject if project ID is not set
        if (empty($project_id)) {
            return;
        }
        
        $sdk_url = $this->get_sdk_url();
        $debug_enabled = get_option('przio_popup_enable_debug', false);
        
        // Build script tag
        $script_attributes = array(
            'src' => esc_url($sdk_url),
            'data-project-id' => esc_attr($project_id),
        );
        
        // Add async attribute for better performance
        $script_attributes['async'] = true;
        
        // Output script tag
        echo '<script';
        foreach ($script_attributes as $attr => $value) {
            if ($attr === 'async') {
                echo ' async';
            } else {
                echo ' ' . esc_attr($attr) . '="' . esc_attr($value) . '"';
            }
        }
        echo '></script>' . "\n";
        
        // If debug is enabled, add initialization script
        if ($debug_enabled) {
            ?>
            <script>
                if (typeof window.PrzioSDK !== 'undefined') {
                    window.PrzioSDK.init({
                        projectId: '<?php echo esc_js($project_id); ?>',
                        debug: true
                    });
                }
            </script>
            <?php
        }
    }
    
    /**
     * Add plugin action links
     */
    public function add_plugin_action_links($links) {
        $settings_link = '<a href="' . admin_url('options-general.php?page=przio-popup') . '">' . __('Settings', 'przio-popup') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }
}

/**
 * Initialize the plugin
 */
function przio_popup_init() {
    return Przio_Popup::get_instance();
}

// Start the plugin
przio_popup_init();

