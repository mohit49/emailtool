=== Przio Popup ===
Contributors: przio
Tags: popup, popups, forms, email, marketing, lead generation
Requires at least: 5.0
Tested up to: 6.9
Stable tag: 1.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Easily integrate Przio popups into your WordPress site. Add your project ID and the SDK will automatically inject popups based on your settings.

== Description ==

Przio Popup is a WordPress plugin that makes it easy to integrate Przio popups into your WordPress website. Simply enter your Project ID in the settings, and the plugin will automatically inject the Przio SDK script into your site.

**Features:**

* Simple setup - just enter your Project ID
* Automatic script injection - no coding required
* Custom SDK URL support for self-hosted installations
* Debug mode for troubleshooting
* Lightweight and fast
* Works with all WordPress themes

**How It Works:**

1. Install and activate the plugin
2. Go to Settings > Przio Popup
3. Enter your Przio Project ID
4. Save settings
5. The SDK will automatically be injected into your site's footer

The plugin injects the Przio SDK script with your Project ID, which enables all your configured popups to appear on your WordPress site based on the rules you've set up in your Przio dashboard.

== Installation ==

1. Upload the `przio-popup` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to Settings > Przio Popup
4. Enter your Przio Project ID
5. Save settings

== Frequently Asked Questions ==

= Where do I find my Project ID? =

You can find your Project ID in your Przio dashboard:
1. Log in to your Przio account
2. Navigate to your project
3. Go to Project Settings
4. Copy the Project ID

= Can I use a custom SDK URL? =

Yes! If you're self-hosting the Przio SDK, you can enter a custom SDK URL in the settings. If left empty, it defaults to your site's URL + /sdk.js

= How do I test if it's working? =

After saving your settings, visit your website and open the browser console (F12). You should see Przio SDK initialization messages if debug mode is enabled.

= Does this work with all themes? =

Yes, the plugin works with all WordPress themes. It injects the SDK script in the footer, which is compatible with all themes.

= Can I disable the plugin on specific pages? =

You can use WordPress conditional tags in your theme's functions.php to conditionally disable the script injection if needed.

== Screenshots ==

1. Settings page where you enter your Project ID
2. Plugin automatically injects the SDK script
3. Plugin icon in WordPress plugin directory

== Changelog ==

= 1.1.0 =
* Added support for both Popup SDK and Email SDK
* Added step-by-step account creation flow with action buttons
* Updated logo to use absolute path from przio.com
* Improved user onboarding experience
* Added SDK type selector (Popup/Email)
* Enhanced settings page with guided setup

= 1.0.1 =
* Fixed WordPress.org validation errors
* Updated tested up to WordPress 6.9
* Fixed plugin header issues
* Added translators comment for better i18n support

= 1.0.0 =
* Initial release
* Project ID configuration
* Automatic SDK script injection
* Custom SDK URL support
* Debug mode option

== Upgrade Notice ==

= 1.1.0 =
New features: Support for both Popup and Email SDKs, step-by-step account creation flow, and improved onboarding experience.

= 1.0.1 =
Bug fixes and WordPress.org compatibility improvements.

= 1.0.0 =
Initial release of Przio Popup plugin.

