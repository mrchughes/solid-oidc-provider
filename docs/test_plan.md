# Solid OIDC Provider Test Plan

This document outlines the comprehensive test plan for the Solid OIDC Provider, ensuring that all required API endpoints and flows from the specification are properly tested.

## Test Collections

The test suite consists of two Postman collections:

1. **Primary Collection (`solid_oidc_collection.json`)**
   - Tests basic OIDC Provider functionality
   - Includes discovery endpoints, JWKS, and basic user operations

2. **Additional Tests Collection (`solid_oidc_additional_tests.json`)**
   - Tests comprehensive authorization flows and account management
   - Includes PKCE support, refresh token flow, and two-factor authentication

## Coverage Matrix

| Requirement | Primary Collection | Additional Collection | Status |
|-------------|-------------------|----------------------|--------|
| OIDC Discovery | ✓ | - | Covered |
| JWKS Endpoint | ✓ | - | Covered |
| User Registration | ✓ | - | Covered |
| User Login | ✓ | - | Covered |
| Password Reset | ✓ | - | Covered |
| Authorization Endpoint | - | ✓ | Covered |
| Token Endpoint | - | ✓ | Covered |
| PKCE Support | - | ✓ | Covered |
| Refresh Tokens | - | ✓ | Covered |
| Userinfo Endpoint | - | ✓ | Covered |
| Two-Factor Authentication | - | ✓ | Covered |
| Client Registration | - | ✓ | Covered |
| Active Sessions | - | ✓ | Covered |
| Consent Management | - | ✓ | Covered |

## Test Execution

Tests can be run using the following npm scripts:

```bash
# Run all tests
npm run test:postman

# Get a summary of test results
npm run test:postman:summary
```

## Test Groups

### 1. Basic OIDC Functionality

These tests verify the core OpenID Connect functionality:

- **OIDC Discovery**: Tests the `/.well-known/openid-configuration` endpoint
- **JWKS Endpoint**: Verifies the JSON Web Key Set endpoint returns valid keys
- **User Management**: Tests user registration, login, and password reset

### 2. Authorization Flow

These tests verify the complete OAuth 2.0 authorization flow:

- **Authorization Request**: Tests the `/authorize` endpoint with PKCE
- **Token Exchange**: Tests exchanging an authorization code for tokens
- **Refresh Token Flow**: Tests obtaining new tokens using a refresh token
- **Userinfo Endpoint**: Verifies the `/userinfo` endpoint returns user data

### 3. Two-Factor Authentication

These tests verify the two-factor authentication flow:

- **2FA Setup**: Tests setting up two-factor authentication
- **2FA Verification**: Tests verifying a two-factor authentication code

### 4. Account Management

These tests verify user account management features:

- **Active Sessions**: Tests viewing active user sessions
- **Consent Management**: Tests revoking consent for a client application

## Solid OIDC-Specific Requirements

The tests also verify Solid OIDC-specific requirements:

- **WebID Claim**: Verifies ID tokens include the `webid` claim
- **PKCE Support**: Verifies PKCE is supported for secure authorization
- **Client Registration**: Tests dynamic client registration

## Test Environment

Tests run against a local instance of the Solid OIDC Provider. The test runner scripts handle:

1. Creating a temporary environment file with necessary variables
2. Verifying the server is running (or starting it if needed)
3. Running both test collections
4. Cleaning up temporary files

## Test Reports

The test summary script provides a concise report of:

- Total tests run
- Passed/failed tests
- Failing tests with reasons
- Overall test pass rate
