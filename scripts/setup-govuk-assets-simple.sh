#!/bin/bash

# A simplified script to download and examine GOV.UK Frontend structure

set -e

echo "Downloading GOV.UK Frontend..."

# Create temp directory
TEMP_DIR=$(mktemp -d)
DOWNLOAD_URL="https://github.com/alphagov/govuk-frontend/releases/download/v5.0.0/release-v5.0.0.zip"

echo "Downloading from $DOWNLOAD_URL"
curl -L -o "$TEMP_DIR/govuk-frontend.zip" "$DOWNLOAD_URL" --retry 3

echo "Extracting files..."
unzip -q "$TEMP_DIR/govuk-frontend.zip" -d "$TEMP_DIR"

echo "Listing contents of the downloaded package:"
find "$TEMP_DIR" -type f | grep -v "__MACOSX" | sort

# Clean up
echo "Cleaning up..."
rm -rf "$TEMP_DIR"

echo "Done!"
