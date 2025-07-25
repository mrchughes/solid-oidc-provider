# Running Additional Tests for Solid OIDC Provider

This document outlines how to use the additional test files created to ensure comprehensive coverage of the Solid OIDC Provider functionality.

## Unit and Integration Tests

We've added several new test files to extend the test coverage:

### Integration Tests

1. **OIDC Endpoints Test** (`/test/integration/oidc.test.js`)
   - Tests the OpenID Connect discovery endpoint
   - Tests the JWKS endpoint
   - Tests the password reset flow

2. **Consent Flow Test** (`/test/integration/consent.test.js`)
   - Tests the consent page rendering
   - Tests consent acceptance and rejection

3. **Profile Management Test** (`/test/integration/profile.test.js`)
   - Tests user profile viewing and updating
   - Tests session management
   - Tests application authorization management

### Unit Tests

1. **JWT Utilities Test** (`/test/unit/jwt.utils.test.js`)
   - Tests token generation
   - Tests token verification
   - Tests token decoding
   - Tests handling of invalid tokens

2. **Two-Factor Authentication Test** (`/test/unit/twoFactor.utils.test.js`)
   - Tests TOTP secret generation
   - Tests TOTP code generation
   - Tests TOTP verification
   - Tests QR code URL generation

3. **Validation Utilities Test** (`/test/unit/validation.utils.test.js`)
   - Tests email validation
   - Tests password validation
   - Tests WebID validation
   - Tests input sanitization

4. **Email Service Test** (`/test/unit/email.service.test.js`)
   - Tests password reset email
   - Tests verification email
   - Tests two-factor authentication email
   - Tests application authorization notification
   - Tests password change notification

## Running the Tests

To run all tests:

```bash
npm test
```

To run a specific test file:

```bash
npm test -- test/integration/oidc.test.js
```

To run tests with coverage:

```bash
npm run test:coverage
```

## Postman Collection

We've also included additional Postman tests in the `solid_oidc_additional_tests.json` file. These tests cover:

1. **OIDC Discovery** - Extended tests for discovery endpoint
2. **JWKS Endpoint** - Detailed validation of key format
3. **Client Registration with WebID Scope** - Testing WebID-specific client registration
4. **User Registration with WebID** - Creating users with custom WebIDs
5. **WebID in Tokens** - Verifying WebID claim in tokens
6. **Token Refresh** - Testing refresh token functionality
7. **Error Handling** - Testing invalid token responses

### Running Postman Tests

1. Import both Postman collections:
   - `solid_oidc_collection.json` (main collection)
   - `solid_oidc_additional_tests.json` (additional tests)

2. Create an environment with the following variables:
   - `base_url`: The base URL of your OIDC provider (e.g., `http://localhost:3001`)

3. Run the collections using the Postman Runner or with Newman:

```bash
npm install -g newman
newman run solid_oidc_collection.json -e environment.json
newman run solid_oidc_additional_tests.json -e environment.json
```

## Continuous Integration

To set up continuous integration with GitHub Actions, create a workflow file:

```yaml
name: Test Solid OIDC Provider

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16.x'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm run test:coverage
    - name: Run Postman tests
      run: |
        npm install -g newman
        newman run solid_oidc_collection.json -e test-environment.json
        newman run solid_oidc_additional_tests.json -e test-environment.json
```

## Test Coverage Areas

The combined tests provide coverage for:

1. **OIDC Compliance**
   - Discovery endpoint
   - JWKS endpoint
   - Authorization flow
   - Token endpoint
   - UserInfo endpoint

2. **Solid OIDC Features**
   - WebID integration
   - Token format compliance
   - Client registration

3. **Security**
   - Authentication flow
   - Token security
   - Password reset flow

4. **Session Management**
   - Session creation
   - Session timeout
   - Session renewal
   - Multiple sessions

5. **User Management**
   - Registration
   - Login
   - Profile updates
   - Password management

6. **Consent Management**
   - Client consent
   - Scope permissions
   - Consent revocation
