# Przio Popup WordPress Plugin

A complete WordPress plugin package for integrating Przio popups into WordPress websites.

## 📦 Package Contents

```
przio-popup/
├── przio-popup.php          # Main plugin file
├── uninstall.php            # Cleanup script
├── readme.txt               # WordPress.org format readme
├── README.md                # Detailed documentation
└── assets/
    └── icon-256x256.png     # Plugin icon (256x256 PNG)
```

## 🚀 Quick Start

### Building the Package

Run the build script to create a distributable ZIP:

```bash
cd wordpress-plugin
./build-package.sh
```

This will create `przio-popup.zip` ready for distribution.

### Manual Build

If you prefer to build manually:

```bash
cd wordpress-plugin
zip -r przio-popup.zip przio-popup/ -x "*.git*" -x "*.DS_Store" -x "*.md"
```

## 📋 Features

- ✅ **Simple Setup** - Just enter your Project ID
- ✅ **Automatic Injection** - SDK script automatically added to footer
- ✅ **Custom SDK URL** - Support for self-hosted installations
- ✅ **Debug Mode** - Enable console logging for troubleshooting
- ✅ **Clean Uninstall** - Removes all options when uninstalled
- ✅ **WordPress Standards** - Follows WordPress coding standards
- ✅ **Plugin Icon** - Professional icon in plugin directory

## 🎨 Logo/Icon

The plugin includes a logo icon (`assets/icon-256x256.png`) that displays in:
- WordPress plugin directory listing
- Plugin settings page header
- Plugin management screens

**To update the logo:**
1. Create a 256x256 PNG image
2. Save it as `przio-popup/assets/icon-256x256.png`
3. Rebuild the package

## 📝 Installation

### For End Users

1. Download `przio-popup.zip`
2. Go to WordPress Admin > Plugins > Add New
3. Click "Upload Plugin"
4. Select `przio-popup.zip`
5. Click "Install Now"
6. Activate the plugin
7. Go to Settings > Przio Popup
8. Enter your Project ID
9. Save settings

### For Developers

1. Extract the ZIP to `/wp-content/plugins/`
2. Activate via Plugins menu
3. Configure in Settings > Przio Popup

## 🔧 Configuration

After activation, configure the plugin:

1. **Project ID** (Required)
   - Enter your Przio Project ID
   - Found in Przio dashboard > Project Settings

2. **SDK URL** (Optional)
   - Custom URL for self-hosted SDK
   - Defaults to `your-site.com/sdk.js` if empty

3. **Debug Mode** (Optional)
   - Enable console logging
   - Useful for troubleshooting

## 📚 Documentation

- **User Guide**: See `przio-popup/README.md`
- **Installation**: See `INSTALLATION.md`
- **Package Guide**: See `PACKAGE.md`

## 🧪 Testing

Before distributing, test:

- [ ] Plugin activates without errors
- [ ] Settings page loads and saves correctly
- [ ] SDK script injects on frontend
- [ ] Plugin deactivates cleanly
- [ ] Uninstall removes all data
- [ ] Logo displays correctly
- [ ] No PHP errors or warnings

## 📦 Distribution

### WordPress.org Submission

1. Ensure `readme.txt` follows WordPress.org standards
2. Test all functionality
3. Submit via WordPress.org SVN

### Direct Distribution

1. Build package using `build-package.sh`
2. Host `przio-popup.zip` on your website
3. Provide download link with instructions

## 🔒 Security

The plugin follows WordPress security best practices:

- ✅ Input sanitization
- ✅ Output escaping
- ✅ Capability checks
- ✅ Nonce verification
- ✅ Prepared statements (where applicable)

## 📄 License

GPL v2 or later

## 🆘 Support

For support and documentation:
- Visit: https://przio.com/support
- Documentation: https://przio.com/docs

## 📈 Version History

### 1.0.0
- Initial release
- Project ID configuration
- Automatic SDK injection
- Custom SDK URL support
- Debug mode
- Plugin icon
- Clean uninstall

