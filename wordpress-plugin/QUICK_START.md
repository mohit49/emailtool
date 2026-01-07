# Przio Popup WordPress Plugin - Quick Start

## ✅ Package Created Successfully!

The WordPress plugin package has been created and is ready for distribution.

## 📦 Package Location

- **ZIP File**: `wordpress-plugin/przio-popup.zip`
- **Source Directory**: `wordpress-plugin/przio-popup/`

## 📋 Package Contents

✅ **przio-popup.php** - Main plugin file with all functionality  
✅ **uninstall.php** - Cleanup script for plugin removal  
✅ **readme.txt** - WordPress.org format readme  
✅ **README.md** - Detailed documentation  
✅ **assets/icon-256x256.png** - Plugin logo/icon  

## 🚀 Installation Steps

### For End Users:

1. **Download** `przio-popup.zip`
2. **Go to** WordPress Admin → Plugins → Add New
3. **Click** "Upload Plugin"
4. **Select** `przio-popup.zip`
5. **Click** "Install Now"
6. **Activate** the plugin
7. **Go to** Settings → Przio Popup
8. **Enter** your Przio Project ID
9. **Save** settings

### For Developers:

```bash
cd wordpress-plugin
unzip przio-popup.zip -d /path/to/wordpress/wp-content/plugins/
```

Then activate via WordPress admin.

## ⚙️ Configuration

After activation:

1. Navigate to **Settings → Przio Popup**
2. Enter your **Project ID** (required)
3. Optionally set **Custom SDK URL**
4. Optionally enable **Debug Mode**
5. Click **Save Settings**

## 🎨 Logo

The plugin includes a logo icon that displays:
- In WordPress plugin directory listing
- On the plugin settings page header
- In plugin management screens

**Logo Location**: `przio-popup/assets/icon-256x256.png`

To update the logo:
1. Create a 256x256 PNG image
2. Replace `przio-popup/assets/icon-256x256.png`
3. Rebuild package using `./build-package.sh`

## 🔄 Rebuilding the Package

To rebuild the package after making changes:

```bash
cd wordpress-plugin
./build-package.sh
```

This will create a new `przio-popup.zip` file.

## 📚 Documentation

- **User Guide**: `przio-popup/README.md`
- **Package Guide**: `PACKAGE.md`
- **Installation Guide**: `INSTALLATION.md`
- **Main README**: `README.md`

## ✨ Features

- ✅ Simple setup with Project ID
- ✅ Automatic SDK script injection
- ✅ Custom SDK URL support
- ✅ Debug mode for troubleshooting
- ✅ Clean uninstall (removes all data)
- ✅ Professional plugin icon
- ✅ WordPress coding standards
- ✅ Security best practices

## 🧪 Testing Checklist

Before distributing, verify:

- [x] Package builds successfully
- [ ] Plugin activates without errors
- [ ] Settings page loads correctly
- [ ] Settings save and persist
- [ ] SDK script injects on frontend
- [ ] Plugin deactivates cleanly
- [ ] Uninstall removes all options
- [ ] Logo displays in plugin directory
- [ ] No PHP errors or warnings

## 📦 Distribution

### Direct Distribution

1. Host `przio-popup.zip` on your website
2. Provide download link
3. Include installation instructions

### WordPress.org Submission

1. Ensure `readme.txt` follows WordPress.org standards
2. Test all functionality thoroughly
3. Submit via WordPress.org SVN repository

## 🆘 Support

For issues or questions:
- Check documentation in `przio-popup/README.md`
- Visit Przio support: https://przio.com/support

---

**Package Version**: 1.0.0  
**WordPress Required**: 5.0+  
**PHP Required**: 7.2+  
**License**: GPL v2 or later

