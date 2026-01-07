# Przio Popup WordPress Plugin - Installation Guide

## Quick Start

1. **Download the Plugin**
   - The plugin is located in the `wordpress-plugin/przio-popup/` directory
   - You can zip the `przio-popup` folder to create an installable package

2. **Install in WordPress**
   - Go to your WordPress admin dashboard
   - Navigate to **Plugins > Add New**
   - Click **Upload Plugin**
   - Choose the `przio-popup.zip` file
   - Click **Install Now**
   - Click **Activate Plugin**

3. **Configure the Plugin**
   - Go to **Settings > Przio Popup**
   - Enter your Przio Project ID
   - (Optional) Set a custom SDK URL if self-hosting
   - (Optional) Enable debug mode for troubleshooting
   - Click **Save Settings**

4. **Test the Integration**
   - Visit your website
   - Open browser console (F12)
   - Check for Przio SDK initialization messages
   - Verify popups appear based on your configured rules

## Manual Installation

If you prefer to install manually:

1. Upload the `przio-popup` folder to `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Follow step 3 above to configure

## Creating a ZIP File for Distribution

To create a distributable ZIP file:

```bash
cd wordpress-plugin
zip -r przio-popup.zip przio-popup/
```

This will create a `przio-popup.zip` file that can be uploaded to WordPress.

## File Structure

```
przio-popup/
├── przio-popup.php    # Main plugin file
├── readme.txt         # WordPress.org readme format
└── README.md          # Detailed documentation
```

## Requirements

- WordPress 5.0 or higher
- PHP 7.2 or higher

## Support

For issues or questions:
- Check the plugin's README.md for detailed documentation
- Visit Przio support: https://przio.com/support

