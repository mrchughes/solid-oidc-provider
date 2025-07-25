# GOV.UK Styled Solid OIDC Provider - Postman Guide

This document provides guidance on using the Postman collection for testing the GOV.UK styled Solid OIDC Provider implementation.

## Overview

The GOV.UK Styled Solid OIDC Provider collection is designed to test both the OIDC functionality and the GOV.UK Design System styling implementation. It contains requests that verify:

1. OIDC protocol compliance
2. GOV.UK Design System styling on HTML pages
3. Authentication flows
4. User management functionality

## Setting Up

### Prerequisites

- [Postman](https://www.postman.com/downloads/) desktop application or [Postman for VS Code extension](https://marketplace.visualstudio.com/items?itemName=Postman.postman-for-vscode)
- Node.js and npm
- The Solid OIDC Provider service running locally

### Import the Collection

1. **Automatic Setup**: 
   - Run the provided script: `./scripts/launch_govuk_postman.sh`
   - This will create the environment file, check if the server is running, and launch Postman with the collection

2. **Manual Setup**:
   - Import `govuk_solid_oidc_collection.json` into Postman
   - Import `govuk_solid_oidc_environment.json` as an environment
   - Select the "GOV.UK Solid OIDC Environment" from the environment dropdown

## Collection Structure

The collection is organized to follow the typical OIDC flow and also includes requests to verify the GOV.UK styling:

1. **OIDC Discovery** - Retrieves the OpenID configuration
2. **JWKS** - Gets the JSON Web Key Set
3. **Register Client** - Registers a new OIDC client
4. **User Registration** - Creates a new user
5. **Login Page (HTML)** - Verifies the GOV.UK styling on the login page
6. **User Login** - Authenticates a user and obtains tokens
7. **Get User Info** - Retrieves user information using the access token
8. **Get Profile Page (HTML)** - Verifies the GOV.UK styling on the profile page
9. **Reset Password Request** - Tests the password reset functionality
10. **Get Register Page (HTML)** - Verifies the GOV.UK styling on the registration page

## Running the Tests

### Run the Complete Collection

1. Open the collection in Postman
2. Click the "Run" button
3. Select all requests and click "Run"

### Run Individual Requests

To test specific functionality:

1. **OIDC Protocol Testing**: Run requests 1-4, 6-7 to test the OIDC implementation
2. **GOV.UK Styling Testing**: Run requests 5, 8, 10 to test the GOV.UK Design System implementation
3. **User Management**: Run requests 4, 6, 9 to test user creation, authentication, and password reset

## Verifying GOV.UK Styling

The collection includes specific tests for GOV.UK styling elements:

1. **HTML Structure**: Checks for the presence of GOV.UK template classes
2. **Component Usage**: Verifies that GOV.UK components are properly implemented
3. **JavaScript Integration**: Confirms that GOV.UK Frontend JavaScript is loaded and initialized

## Environment Variables

The collection uses environment variables to store and pass data between requests:

- `base_url`: The base URL of the Solid OIDC Provider
- `client_id`, `client_secret`: OIDC client credentials
- `access_token`, `id_token`: Authentication tokens
- `test_email`, `test_password`: User credentials
- `webid`: The WebID of the authenticated user

## Troubleshooting

### Common Issues

1. **Server not running**: Ensure the Solid OIDC Provider is running on port 3001
2. **Authentication failures**: Check that user registration was successful
3. **Missing environment variables**: Run the requests in sequence as they set up variables for subsequent requests

### Logs and Debugging

- View the Postman console for detailed logs
- Check pre-request and test script outputs for debugging information

## Extending the Collection

To add new tests or functionality:

1. Duplicate an existing request as a template
2. Modify the URL, headers, and body as needed
3. Update pre-request and test scripts to handle the new request
4. Add appropriate tests for GOV.UK styling if testing HTML pages

## Maintenance

Keep the collection up to date by:

1. Updating the collection when new endpoints are added
2. Ensuring the GOV.UK styling tests match the latest Design System guidelines
3. Updating environment variables as needed for new functionality
