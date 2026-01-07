# Przio Popup WordPress Plugin

A WordPress plugin that makes it easy to integrate Przio popups into your WordPress website.

## Features

- ✅ Simple setup - just enter your Project ID
- ✅ Automatic script injection - no coding required
- ✅ Custom SDK URL support for self-hosted installations
- ✅ Debug mode for troubleshooting
- ✅ Lightweight and fast
- ✅ Works with all WordPress themes

## Installation

1. Upload the `przio-popup` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to **Settings > Przio Popup**
4. Enter your Przio Project ID
5. Save settings

## Configuration

### Finding Your Project ID

1. Log in to your Przio account
2. Navigate to your project
3. Go to Project Settings
4. Copy the Project ID

### Settings Options

- **Project ID** (Required): Your Przio Project ID
- **SDK URL** (Optional): Custom SDK URL for self-hosted installations. Defaults to `your-site.com/sdk.js` if left empty
- **Enable Debug Mode**: Enable debug logging in browser console for troubleshooting

## How It Works

The plugin automatically injects the Przio SDK script into your site's footer with your Project ID. The script tag looks like this:

```html
<script src="https://your-site.com/sdk.js" data-project-id="YOUR_PROJECT_ID" async></script>
```

Once the SDK is loaded, it will automatically:
- Fetch your popup configurations from the Przio API
- Check URL conditions
- Display popups based on your trigger settings
- Track metrics and form submissions

## Testing

After saving your settings:

1. Visit your website
2. Open the browser console (F12)
3. If debug mode is enabled, you should see Przio SDK initialization messages
4. Check that popups appear based on your configured rules

## Troubleshooting

### SDK Not Loading

1. Check that your Project ID is correct
2. Verify the SDK URL is accessible
3. Check browser console for errors
4. Enable debug mode for detailed logging

### Popups Not Showing

1. Verify your popup is published in Przio dashboard
2. Check URL conditions match your current page
3. Verify trigger settings (page load, scroll, exit intent, etc.)
4. Check if popup was previously closed (cookie/session settings)

## Requirements

- WordPress 5.0 or higher
- PHP 7.2 or higher

## Support

For support, please visit [Przio Support](https://przio.com/support) or check the [Przio Documentation](https://przio.com/docs).

## License

GPL v2 or later

