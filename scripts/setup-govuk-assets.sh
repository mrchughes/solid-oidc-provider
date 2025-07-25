#!/bin/bash

# Script to download and set up GOV.UK Design System assets
# This script downloads the latest version of the GOV.UK Frontend and extracts 
# the necessary assets to the project's public directory.

# Exit on error
set -e

echo "Downloading and setting up GOV.UK Design System assets..."

# Create directories if they don't exist
mkdir -p public/assets/css
mkdir -p public/assets/js
mkdir -p public/assets/fonts
mkdir -p public/assets/images

# Use a specific known version of GOV.UK Frontend
VERSION="4.7.0"
echo "Using GOV.UK Frontend version $VERSION"

# Download the release
TEMP_DIR=$(mktemp -d)
DOWNLOAD_URL="https://github.com/alphagov/govuk-frontend/releases/download/v$VERSION/release-v$VERSION.zip"

echo "Downloading from $DOWNLOAD_URL"
curl -L -o "$TEMP_DIR/govuk-frontend.zip" "$DOWNLOAD_URL" --retry 3

echo "Extracting files..."
unzip -q "$TEMP_DIR/govuk-frontend.zip" -d "$TEMP_DIR"

# Copy required files to the public directory
echo "Copying CSS..."
cp "$TEMP_DIR/govuk-frontend-$VERSION.min.css" public/assets/css/govuk-frontend.min.css

echo "Copying JavaScript..."
cp "$TEMP_DIR/govuk-frontend-$VERSION.min.js" public/assets/js/govuk-frontend.min.js

echo "Copying fonts..."
cp -r "$TEMP_DIR/assets/fonts/" public/assets/fonts/

echo "Copying images..."
cp -r "$TEMP_DIR/assets/images/" public/assets/images/

# Create favicon and touch icons
echo "Creating favicon and icons..."
# The crown logo image might not be available in this version, so we'll skip this if it doesn't exist
if [ -f "$TEMP_DIR/assets/images/favicon.ico" ]; then
  cp "$TEMP_DIR/assets/images/favicon.ico" public/assets/images/
fi

if [ -f "$TEMP_DIR/assets/images/govuk-icon-180.png" ]; then
  cp "$TEMP_DIR/assets/images/govuk-icon-180.png" public/assets/images/
fi

# Clean up
echo "Cleaning up..."
rm -rf "$TEMP_DIR"

echo "GOV.UK Design System assets setup complete!"
echo "Assets installed in public/assets/"
