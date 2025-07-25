#!/bin/bash
# Script to launch VS Code with the Postman extension and set up the workspace

# Check if VS Code is installed
if ! command -v code &> /dev/null; then
    echo "VS Code is not installed or not in PATH"
    exit 1
fi

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PARENT_DIR="$(dirname "$DIR")"

# Launch VS Code with the solid-oidc-provider workspace
code "$PARENT_DIR/solid-oidc-provider.code-workspace"

# Instructions for the user
echo "VS Code is launching..."
echo ""
echo "To set up Postman in VS Code:"
echo "1. Click on the Postman icon in the Activity Bar (side bar)"
echo "2. Sign in to your Postman account"
echo "3. Import the workspace and collection from the project:"
echo "   - postman_workspace.json"
echo "   - solid_oidc_collection.json"
echo "4. Set up your environments as specified in the workspace file"
echo ""
echo "The collection includes pre-request and post-response scripts that:"
echo "- Set up environment variables for each request"
echo "- Generate test data when needed"
echo "- Validate responses according to OIDC specifications"
echo "- Store response data for subsequent requests"
echo ""
echo "See the POSTMAN_GUIDE.md file for detailed instructions."
echo "For more information about the scripts, refer to docs/postman_scripts_guidelines.md"
