#!/bin/bash

# Script to process logo: remove white background and resize
# Requires ImageMagick to be installed

LOGO_DIR="public/icons"
ORIGINAL_LOGO="$LOGO_DIR/turbine-navigator-logo.png"
PROCESSED_LOGO="$LOGO_DIR/turbine-navigator-logo-processed.png"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install it first:"
    echo "  macOS: brew install imagemagick"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  RHEL/CentOS: sudo yum install ImageMagick"
    exit 1
fi

echo "Processing logo: $ORIGINAL_LOGO"

# Remove white background (make it transparent) and resize to 128x128
convert "$ORIGINAL_LOGO" \
    -fuzz 10% \
    -transparent white \
    -background none \
    -resize 128x128 \
    -gravity center \
    -extent 128x128 \
    "$PROCESSED_LOGO"

echo "Created transparent logo: $PROCESSED_LOGO"

# Create different sizes for the extension
SIZES=(16 32 48 128)

for size in "${SIZES[@]}"; do
    OUTPUT_FILE="$LOGO_DIR/icon${size}.png"

    convert "$PROCESSED_LOGO" \
        -resize ${size}x${size} \
        -background none \
        -gravity center \
        -extent ${size}x${size} \
        "$OUTPUT_FILE"

    echo "Created ${size}x${size} icon: $OUTPUT_FILE"
done

# Replace the original logo with the processed one
mv "$PROCESSED_LOGO" "$ORIGINAL_LOGO"

echo "✅ Logo processing complete!"
echo "Original logo has been replaced with transparent background version"
echo "Multiple icon sizes have been created in $LOGO_DIR"