# Przio Popup WordPress Plugin - Package Guide

## Package Structure

```
przio-popup/
├── przio-popup.php          # Main plugin file
├── uninstall.php            # Cleanup script when plugin is uninstalled
├── readme.txt               # WordPress.org format readme
├── README.md                # Detailed documentation
└── assets/
    ├── icon-256x256.png     # Plugin icon (256x256 PNG)
    └── .gitkeep             # Directory placeholder
```

## Creating the Package

### Step 1: Add Logo

1. Copy your logo file to the `assets` directory
2. Resize it to 256x256 pixels (WordPress standard)
3. Save it as `icon-256x256.png`

**Using ImageMagick:**
```bash
convert logo-web.png -resize 256x256 assets/icon-256x256.png
```

**Using online tools:**
- Use any image resizer to create a 256x256 PNG
- Place it in the `assets` folder

### Step 2: Create ZIP Package

From the `wordpress-plugin` directory:

```bash
cd wordpress-plugin
zip -r przio-popup.zip przio-popup/ -x "*.git*" -x "*.DS_Store"
```

Or using tar:

```bash
cd wordpress-plugin
tar -czf przio-popup.tar.gz przio-popup/
```

### Step 3: Verify Package Contents

The ZIP should contain:
- ✅ przio-popup.php
- ✅ uninstall.php
- ✅ readme.txt
- ✅ README.md
- ✅ assets/icon-256x256.png

## Installation

Users can install the plugin by:

1. **WordPress Admin:**
   - Go to Plugins > Add New
   - Click "Upload Plugin"
   - Select `przio-popup.zip`
   - Click "Install Now"
   - Activate the plugin

2. **Manual Installation:**
   - Extract ZIP to `/wp-content/plugins/`
   - Activate via Plugins menu

3. **WordPress.org Repository (if submitted):**
   - Search for "Przio Popup"
   - Click "Install Now"
   - Activate

## Package Requirements

- ✅ Main plugin file with proper headers
- ✅ Uninstall script for cleanup
- ✅ Plugin icon (256x256 PNG)
- ✅ Readme files (readme.txt for WordPress.org)
- ✅ No unnecessary files (.git, .DS_Store, etc.)

## Version Information

- **Current Version:** 1.0.0
- **Requires WordPress:** 5.0+
- **Requires PHP:** 7.2+
- **Tested up to:** WordPress 6.4

## Distribution

### For WordPress.org Submission

1. Ensure `readme.txt` follows WordPress.org standards
2. Include all required files
3. Test plugin activation/deactivation
4. Verify uninstall script works
5. Submit via WordPress.org SVN

### For Direct Distribution

1. Create ZIP package
2. Host on your website
3. Provide download link
4. Include installation instructions

## Testing Checklist

Before distributing:

- [ ] Plugin activates without errors
- [ ] Settings page loads correctly
- [ ] Settings save and persist
- [ ] SDK script injects on frontend
- [ ] Plugin deactivates cleanly
- [ ] Uninstall removes all options
- [ ] Logo displays in plugin directory
- [ ] No PHP errors or warnings
- [ ] Compatible with latest WordPress
- [ ] Works with default themes

