#!/bin/bash
# Script to run Postman collections using Newman

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PARENT_DIR="$(dirname "$DIR")"

# Check if Newman is installed
if ! npm list -g newman &> /dev/null; then
    echo "Newman is not installed globally. Installing it now..."
    npm install -g newman
fi

# Check if the collection files exist
COLLECTION_FILE="$PARENT_DIR/solid_oidc_collection.json"
ADDITIONAL_COLLECTION_FILE="$PARENT_DIR/solid_oidc_additional_tests.json"

if [ ! -f "$COLLECTION_FILE" ]; then
    echo "Collection file not found at $COLLECTION_FILE"
    exit 1
fi

if [ ! -f "$ADDITIONAL_COLLECTION_FILE" ]; then
    echo "Additional collection file not found at $ADDITIONAL_COLLECTION_FILE"
    exit 1
fi

# Set up the server port
SERVER_PORT=3010
BASE_URL="http://localhost:$SERVER_PORT"

# Save original collection
cp "$COLLECTION_FILE" "$PARENT_DIR/original_collection.json"

# Replace all "{{registration_endpoint}}" with actual URL in the collection
sed -i.bak "s|{{registration_endpoint}}|$BASE_URL/register|g" "$COLLECTION_FILE"

# Create a temporary environment file
cat > "$PARENT_DIR/temp_environment.json" << EOL
{
    "name": "Temporary Environment",
    "values": [
        {
            "key": "base_url",
            "value": "$BASE_URL",
            "enabled": true
        },
        {
            "key": "webid",
            "value": "https://user.example.org/profile/card#me",
            "enabled": true
        },
        {
            "key": "authorization_endpoint",
            "value": "$BASE_URL/authorize",
            "enabled": true
        },
        {
            "key": "token_endpoint",
            "value": "$BASE_URL/token",
            "enabled": true
        },
        {
            "key": "userinfo_endpoint",
            "value": "$BASE_URL/userinfo",
            "enabled": true
        },
        {
            "key": "registration_endpoint",
            "value": "$BASE_URL/register",
            "enabled": true
        },
        {
            "key": "jwks_uri",
            "value": "$BASE_URL/jwks",
            "enabled": true
        }
    ]
}
EOL

# Make sure the server is running
SERVER_RUNNING=false
if curl -s "$BASE_URL/.well-known/openid-configuration" > /dev/null; then
    SERVER_RUNNING=true
else
    echo "Server is not running. Starting it now..."
    # Start the server in the background
    cd "$PARENT_DIR" && npm start &
    SERVER_PID=$!
    
    # Wait for the server to start
    echo "Waiting for the server to start..."
    sleep 5
fi

# Run the Postman collection
echo "Running primary Postman tests..."
newman run "$COLLECTION_FILE" --environment "$PARENT_DIR/temp_environment.json"

echo ""
echo "Running additional Postman tests..."
newman run "$ADDITIONAL_COLLECTION_FILE" --environment "$PARENT_DIR/temp_environment.json"

# Clean up
rm -f "$PARENT_DIR/temp_environment.json"
# Restore original collection
mv "$PARENT_DIR/original_collection.json" "$COLLECTION_FILE"
rm -f "$COLLECTION_FILE.bak"

# If we started the server, stop it
if [ "$SERVER_RUNNING" = false ] && [ -n "$SERVER_PID" ]; then
    echo "Stopping the server..."
    kill $SERVER_PID
fi

echo "Postman tests completed."
