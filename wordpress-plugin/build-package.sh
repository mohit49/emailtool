#!/bin/bash

# Build script for Przio Popup WordPress Plugin
# This script creates a distributable ZIP package

set -e

PLUGIN_NAME="przio-popup"
PLUGIN_DIR="przio-popup"
OUTPUT_FILE="${PLUGIN_NAME}.zip"

echo "🚀 Building Przio Popup WordPress Plugin Package..."
echo ""

# Check if plugin directory exists
if [ ! -d "$PLUGIN_DIR" ]; then
    echo "❌ Error: Plugin directory '$PLUGIN_DIR' not found!"
    exit 1
fi

# Remove old package if exists
if [ -f "$OUTPUT_FILE" ]; then
    echo "📦 Removing old package..."
    rm "$OUTPUT_FILE"
fi

# Check for required files
echo "✅ Checking required files..."
REQUIRED_FILES=(
    "$PLUGIN_DIR/przio-popup.php"
    "$PLUGIN_DIR/uninstall.php"
    "$PLUGIN_DIR/readme.txt"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: Required file '$file' not found!"
        exit 1
    fi
done

# Check for logo (warn if missing but continue)
if [ ! -f "$PLUGIN_DIR/assets/icon-256x256.png" ]; then
    echo "⚠️  Warning: Logo file not found at '$PLUGIN_DIR/assets/icon-256x256.png'"
    echo "   The plugin will work without it, but won't have an icon in WordPress."
fi

# Create ZIP package
echo "📦 Creating ZIP package..."
cd "$PLUGIN_DIR"

zip -r "../$OUTPUT_FILE" . \
    -x "*.git*" \
    -x "*.DS_Store" \
    -x "*.swp" \
    -x "*.swo" \
    -x "*~" \
    -x ".gitkeep" \
    -x "*.md" \
    > /dev/null

cd ..

# Verify package was created
if [ -f "$OUTPUT_FILE" ]; then
    SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo ""
    echo "✅ Package created successfully!"
    echo "   File: $OUTPUT_FILE"
    echo "   Size: $SIZE"
    echo ""
    echo "📋 Package contents:"
    unzip -l "$OUTPUT_FILE" | grep -E "\.(php|txt|png)$" | head -20
    echo ""
    echo "✨ Ready for distribution!"
    echo ""
    echo "To install:"
    echo "  1. Go to WordPress Admin > Plugins > Add New"
    echo "  2. Click 'Upload Plugin'"
    echo "  3. Select '$OUTPUT_FILE'"
    echo "  4. Click 'Install Now' and activate"
else
    echo "❌ Error: Failed to create package!"
    exit 1
fi

