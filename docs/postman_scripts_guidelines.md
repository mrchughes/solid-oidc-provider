# Postman Scripts Guidelines

This document provides guidelines for creating and maintaining pre-request and post-response scripts for the Solid OIDC Provider Postman collection.

## Pre-Request Scripts Guidelines

Pre-request scripts run before a request is sent to the server. They are useful for preparing the request, setting up variables, and handling authentication.

### General Guidelines

1. **Initialize Required Variables**
   - Check if required environment variables exist and initialize them if needed
   - Generate random data when appropriate (e.g., for test users)

2. **Prepare Request Body**
   - Set dynamic values in the request body based on environment variables
   - Format data according to API requirements

3. **Handle Authentication**
   - Set up authentication headers or tokens
   - Generate signatures when required

4. **Logging and Documentation**
   - Log important information to help with debugging
   - Document any assumptions or requirements

### Example Pre-request Script

```javascript
// Check and initialize required variables
if (!pm.environment.get("base_url")) {
    pm.environment.set("base_url", "http://localhost:3001");
}

// Generate random data for testing
const randomId = pm.variables.replaceIn('{{$randomUUID}}');
pm.environment.set("random_id", randomId);

// Set up authentication if needed
if (pm.environment.get("access_token")) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + pm.environment.get("access_token")
    });
}

// Log key information
console.log("Preparing request to: " + pm.request.url.toString());
```

## Post-Response (Test) Scripts Guidelines

Test scripts run after receiving a response. They validate the response and extract information for subsequent requests.

### General Guidelines

1. **Validate Response Status**
   - Check if the response status code is as expected
   - Provide meaningful error messages if validation fails

2. **Validate Response Body**
   - Verify that the response contains required fields
   - Check data types and formats
   - Validate business rules and constraints

3. **Extract and Store Data**
   - Extract relevant data from the response
   - Store data in environment variables for use in subsequent requests

4. **OIDC-Specific Validations**
   - Validate OIDC-specific requirements (token format, claims, etc.)
   - Check for required OIDC endpoints and features

### Example Test Script

```javascript
// Validate response status
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Validate response structure
pm.test("Response contains required fields", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('access_token');
    pm.expect(jsonData).to.have.property('token_type').to.eql('Bearer');
    pm.expect(jsonData).to.have.property('expires_in');
});

// Extract and store data
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.access_token);
    pm.environment.set("id_token", jsonData.id_token);
}

// OIDC-specific validations
pm.test("Token contains required claims", function () {
    var jsonData = pm.response.json();
    var idToken = jsonData.id_token;
    
    // Parse JWT (simplified example)
    var parts = idToken.split('.');
    var payload = JSON.parse(atob(parts[1]));
    
    pm.expect(payload).to.have.property('sub');
    pm.expect(payload).to.have.property('iss');
    pm.expect(payload).to.have.property('aud');
    pm.expect(payload).to.have.property('exp');
});
```

## Collection-Level Scripts

Collection-level scripts run for all requests in the collection. They are useful for setting up common variables and validation rules.

### Collection Pre-request Script

Use this for:
- Setting up global variables
- Initializing common authentication tokens
- Setting up test environments

### Collection Test Script

Use this for:
- Common validation rules
- Logging response times
- Error handling
- Cleanup operations

## Best Practices

1. **Keep Scripts Modular**
   - Break down scripts into smaller, reusable functions
   - Avoid duplicating code across multiple requests

2. **Handle Errors Gracefully**
   - Check for error responses and provide meaningful error messages
   - Don't assume the response will always be successful

3. **Document Your Scripts**
   - Add comments to explain complex logic
   - Document environment variables used by the scripts

4. **Chain Requests Properly**
   - When one request depends on another, make sure to store required data
   - Use the collection runner to test the full flow

5. **Test Your Scripts**
   - Verify that your scripts work as expected
   - Test edge cases and error conditions

6. **Keep Security in Mind**
   - Don't hardcode sensitive information in scripts
   - Use environment variables for secrets

## OIDC Flow Testing

For testing the complete OIDC flow, follow these steps:

1. **Discovery** - Get OpenID Configuration
   - Validate required endpoints
   - Store endpoints for subsequent requests

2. **JWKS Endpoint** - Get JSON Web Key Set
   - Validate key format
   - Check required key properties

3. **Client Registration** - Register a client
   - Validate client credentials
   - Store client_id and client_secret

4. **Authorization** - Start authorization flow
   - Generate state and nonce
   - Store for validation later

5. **User Registration/Login** - Create or authenticate user
   - Store user credentials
   - Check WebID format

6. **Token Exchange** - Exchange code for tokens
   - Validate token format
   - Check required claims

7. **UserInfo** - Get user information
   - Validate user profile
   - Check WebID claim
