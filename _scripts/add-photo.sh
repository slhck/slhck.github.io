#!/bin/bash
# Add a photo to the Jekyll photo blog.
# Usage: ./add-photo.sh <image-file> [title] [location] [date]
#
# If title/location not provided, will prompt interactively.
# Date format: YYYY-MM-DD (defaults to today if not provided)
# Skips conversion if already AVIF and ≤2500px.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE_DIR="$(dirname "$SCRIPT_DIR")"
PHOTOS_DIR="$SITE_DIR/_photos"
IMAGES_DIR="$SITE_DIR/assets/images/photos"

MAGICK=$(which magick || which convert)
MAX_DIM=2500
QUALITY=70

# Check dependencies
if [ ! -x "$MAGICK" ]; then
    echo "Error: ImageMagick not found at $MAGICK"
    exit 1
fi

# Check arguments
if [ -z "$1" ]; then
    echo "Usage: $0 <image-file> [title] [location] [date]"
    echo "  date format: YYYY-MM-DD (defaults to today)"
    exit 1
fi

INPUT_FILE="$1"
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: File not found: $INPUT_FILE"
    exit 1
fi

# Get title, location, and date
TITLE="$2"
LOCATION="$3"
DATE_OVERRIDE="$4"

if [ -z "$TITLE" ]; then
    read -p "Title: " TITLE
fi

if [ -z "$LOCATION" ]; then
    read -p "Location: " LOCATION
fi

if [ -z "$DATE_OVERRIDE" ]; then
    read -p "Date [YYYY-MM-DD, enter for today]: " DATE_OVERRIDE
fi

if [ -z "$TITLE" ]; then
    echo "Error: Title is required"
    exit 1
fi

# Generate slug from title
slugify() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//' | cut -c1-50
}

SLUG=$(slugify "$TITLE")

# Handle date
if [ -n "$DATE_OVERRIDE" ]; then
    # Validate date format
    if [[ ! "$DATE_OVERRIDE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        echo "Error: Invalid date format. Use YYYY-MM-DD"
        exit 1
    fi
    DATE="$DATE_OVERRIDE"
    DATETIME="${DATE} 12:00:00 +0000"
else
    DATE=$(date +%Y-%m-%d)
    DATETIME=$(date +"%Y-%m-%d %H:%M:%S +0000")
fi

# Generate unique filename
OUTPUT_NAME="${DATE}-${SLUG}"
AVIF_FILE="$IMAGES_DIR/${OUTPUT_NAME}.avif"
MD_FILE="$PHOTOS_DIR/${OUTPUT_NAME}.md"

# Check if files already exist
if [ -f "$MD_FILE" ]; then
    echo "Warning: $MD_FILE already exists"
    read -p "Overwrite? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get image info
INPUT_EXT="${INPUT_FILE##*.}"
INPUT_EXT_LOWER=$(echo "$INPUT_EXT" | tr '[:upper:]' '[:lower:]')

# Get dimensions
DIMENSIONS=$("$MAGICK" identify -format "%wx%h" "$INPUT_FILE" 2>/dev/null | head -1)
WIDTH=$(echo "$DIMENSIONS" | cut -d'x' -f1)
HEIGHT=$(echo "$DIMENSIONS" | cut -d'x' -f2)
MAX_SIDE=$((WIDTH > HEIGHT ? WIDTH : HEIGHT))

echo "Input: $INPUT_FILE (${WIDTH}x${HEIGHT}, $INPUT_EXT_LOWER)"

# Determine if we need to process
NEEDS_RESIZE=false
NEEDS_CONVERT=false

if [ "$MAX_SIDE" -gt "$MAX_DIM" ]; then
    NEEDS_RESIZE=true
    echo "  → Will resize (>${MAX_DIM}px)"
fi

if [ "$INPUT_EXT_LOWER" != "avif" ]; then
    NEEDS_CONVERT=true
    echo "  → Will convert to AVIF"
fi

# Process image
if [ "$NEEDS_RESIZE" = true ] || [ "$NEEDS_CONVERT" = true ]; then
    echo "Processing..."
    "$MAGICK" "$INPUT_FILE" \
        -resize "${MAX_DIM}x${MAX_DIM}>" \
        -filter Lanczos \
        -unsharp 0x0.75+0.75+0.01 \
        -quality "$QUALITY" \
        -strip \
        "$AVIF_FILE"
    echo "  → Saved: $AVIF_FILE"
else
    # Just copy the file
    echo "Copying (already optimized)..."
    cp "$INPUT_FILE" "$AVIF_FILE"
    echo "  → Copied: $AVIF_FILE"
fi

# Create markdown file
echo "Creating entry..."

# Escape quotes in title and location for YAML
TITLE_ESCAPED=$(echo "$TITLE" | sed 's/"/\\"/g')
LOCATION_ESCAPED=$(echo "$LOCATION" | sed 's/"/\\"/g')

cat > "$MD_FILE" << EOF
---
title: "$TITLE_ESCAPED"
date: $DATETIME
image: ${OUTPUT_NAME}.avif
EOF

if [ -n "$LOCATION" ]; then
    echo "location: \"$LOCATION_ESCAPED\"" >> "$MD_FILE"
fi

echo "---" >> "$MD_FILE"

echo "  → Created: $MD_FILE"
echo ""
echo "Done! Added: $TITLE"
[ -n "$LOCATION" ] && echo "    Location: $LOCATION"
echo "    Date: $DATE"
