# Additional Postman Tests for Solid OIDC Provider

This document outlines the additional Postman tests that have been added to ensure coverage of all must-pass requirements for the Solid OIDC Provider.

## Coverage of Must-Pass Requirements

The additional tests ensure coverage of the following must-pass requirements from the specification:

1. **Full OIDC Flow**
   - Authorization endpoint testing (`/authorize`)
   - Token exchange with PKCE (`/token`)
   - Refresh token usage
   - WebID claim validation

2. **Dynamic Client Registration**
   - Comprehensive client registration testing
   - Validation of client credentials
   - WebID scope support

3. **Two-Factor Authentication**
   - Setup process
   - Verification process

4. **User Account Management**
   - View active sessions
   - Revoke client consent
   - Custom WebID support

5. **Error Handling**
   - Invalid token tests
   - Proper error responses

## Test Descriptions

### Authorization Flow

#### Authorization Request
Tests the `/authorize` endpoint which is the entry point for the OAuth 2.0 authorization code flow. This test verifies:
- The endpoint correctly processes all required parameters
- PKCE (Proof Key for Code Exchange) is properly supported
- The response is either a redirect with a code or a login page

#### Token Exchange
Tests the `/token` endpoint for exchanging an authorization code for tokens. This test verifies:
- The endpoint correctly processes all required parameters
- PKCE code verifier is validated
- The response contains the required tokens (access_token, id_token)
- The tokens follow the correct format
- WebID claim is included and valid

### Dynamic Client Registration

Tests the client registration endpoint for dynamic registration of OAuth clients. This test verifies:
- The endpoint correctly processes the registration request
- The response contains all required client credentials
- The client is properly registered in the system
- WebID scope is supported and processed correctly

### Refresh Token Exchange

Tests the refresh token flow to obtain new tokens without user interaction. This test verifies:
- The `/token` endpoint correctly processes refresh token requests
- The response contains new tokens
- The old refresh token is properly rotated (if token rotation is implemented)
- WebID claims are preserved in the new tokens

### User Registration with Custom WebID

Tests user registration with a custom WebID. This test verifies:
- The registration endpoint accepts a custom WebID parameter
- The user is created with the provided WebID
- The WebID is properly formatted and validated
- The WebID is included in issued tokens

### Invalid Token Handling

Tests error handling for invalid tokens. This test verifies:
- The service properly rejects invalid or expired tokens
- The response includes proper error codes and descriptions
- The WWW-Authenticate header is included in the response
- The error format follows OAuth 2.0 standards

### Account Management

#### View Active Sessions
Tests the ability to view all active sessions for the authenticated user. This test verifies:
- The endpoint returns a list of active sessions
- Each session contains the required information (client ID, creation time, etc.)

#### Revoke Client Consent
Tests the ability to revoke consent for a specific client. This test verifies:
- The endpoint correctly processes the revocation request
- The client's access is properly revoked

### Two-Factor Authentication

#### Two-Factor Setup
Tests the setup process for two-factor authentication. This test verifies:
- The endpoint returns the necessary setup information (secret, QR code)
- The setup process can be completed successfully

#### Two-Factor Verify
Tests the verification process for two-factor authentication. This test verifies:
- The endpoint correctly validates TOTP codes
- Invalid codes are properly rejected

## New Tests in `solid_oidc_additional_tests.json`

The following tests have been added to the additional Postman collection:

1. **OIDC Discovery - Additional Tests** - More comprehensive validation of the discovery document
2. **JWKS - Additional Tests** - Detailed validation of the key format and properties
3. **Register Client with WebID Scope** - Tests client registration with the WebID scope
4. **User Registration with Additional Fields** - Tests registration with a custom WebID
5. **User Login with WebID Test User** - Tests login for a user with a custom WebID
6. **Get User Info with WebID** - Validates the WebID claim in the user information
7. **Try Access with Invalid Token** - Tests error handling for invalid tokens
8. **Refresh Token** - Tests the refresh token flow
9. **Get User Info with New Token** - Validates that the refreshed token works correctly

## Running the Tests

The additional tests are included in the `solid_oidc_additional_tests.json` file and are automatically run as part of the standard test command:

```bash
npm run test:postman
```

Or you can run just the additional tests:

```bash
newman run solid_oidc_additional_tests.json -e environment.json
```

For more details on test execution and integration, see the [TEST_COVERAGE.md](../TEST_COVERAGE.md) and [ADDITIONAL_TESTS.md](../ADDITIONAL_TESTS.md) files.
npm run test:postman
```

For a summary of all test results (including the additional tests):

```bash
npm run test:postman:summary
```
