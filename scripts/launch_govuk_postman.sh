#!/bin/bash

# Script to launch Postman with the GOV.UK styled Solid OIDC Provider collection
# This script creates an environment file and launches Postman with the collection

echo "Setting up Postman for GOV.UK styled Solid OIDC Provider testing..."

# Define paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
COLLECTION_PATH="$ROOT_DIR/govuk_solid_oidc_collection.json"
ENV_PATH="$ROOT_DIR/govuk_solid_oidc_environment.json"

# Create environment file if it doesn't exist
if [ ! -f "$ENV_PATH" ]; then
    echo "Creating environment file..."
    cat > "$ENV_PATH" << EOF
{
  "id": "govuk-solid-oidc-env",
  "name": "GOV.UK Solid OIDC Environment",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:3001",
      "enabled": true
    },
    {
      "key": "client_id",
      "value": "",
      "enabled": true
    },
    {
      "key": "client_secret",
      "value": "",
      "enabled": true
    },
    {
      "key": "redirect_uri",
      "value": "https://client.example.org/callback",
      "enabled": true
    },
    {
      "key": "test_email",
      "value": "",
      "enabled": true
    },
    {
      "key": "test_password",
      "value": "",
      "enabled": true
    },
    {
      "key": "access_token",
      "value": "",
      "enabled": true
    },
    {
      "key": "id_token",
      "value": "",
      "enabled": true
    }
  ],
  "_postman_variable_scope": "environment"
}
EOF
    echo "Environment file created at $ENV_PATH"
fi

# Check if collection exists
if [ ! -f "$COLLECTION_PATH" ]; then
    echo "Error: Collection file not found at $COLLECTION_PATH"
    exit 1
fi

# Check if Newman is installed
if ! command -v newman &> /dev/null; then
    echo "Newman not found. Would you like to install it? (y/n)"
    read -r INSTALL_NEWMAN
    if [ "$INSTALL_NEWMAN" = "y" ]; then
        npm install -g newman
    else
        echo "Newman is required to run the tests. Please install it manually."
        exit 1
    fi
fi

# Check if server is running
if ! curl -s http://localhost:3001/.well-known/openid-configuration > /dev/null; then
    echo "Solid OIDC Provider is not running. Would you like to start it? (y/n)"
    read -r START_SERVER
    if [ "$START_SERVER" = "y" ]; then
        # Start the server in the background
        echo "Starting Solid OIDC Provider..."
        cd "$ROOT_DIR" && npm start &
        SERVER_PID=$!
        # Wait for server to start
        echo "Waiting for server to start..."
        sleep 5
    else
        echo "Please start the server before running the tests."
        exit 1
    fi
fi

# Launch Postman (if installed)
if command -v postman &> /dev/null; then
    echo "Launching Postman with collection..."
    postman import "$COLLECTION_PATH" "$ENV_PATH"
else
    # Run the collection with Newman
    echo "Running tests with Newman..."
    newman run "$COLLECTION_PATH" -e "$ENV_PATH"
fi

echo "Done!"
