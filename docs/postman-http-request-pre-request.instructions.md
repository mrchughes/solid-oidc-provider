# Postman HTTP Request Pre-Request Scripts

This document outlines the standard patterns and practices for pre-request scripts in the Solid OIDC Provider Postman collection.

## Purpose

Pre-request scripts execute before the request is sent to the server. They help with:

1. Setting up dynamic variables
2. Generating authentication tokens
3. Preparing request data
4. Logging request information

## Standard Script Template

```javascript
// 1. VARIABLE INITIALIZATION
// Check if required variables exist and initialize if needed
if (!pm.environment.get("user_email")) {
    pm.environment.set("user_email", "test_" + Math.random().toString(36).substring(2, 8) + "@example.com");
}

// 2. AUTHENTICATION
// Generate or set authentication tokens if needed
if (pm.request.url.toString().includes("protected")) {
    if (!pm.environment.get("access_token")) {
        console.log("Warning: No access token found. This request might fail.");
    }
}

// 3. REQUEST BODY PREPARATION
// Modify request body if needed
if (pm.request.method === "POST" && pm.request.body && pm.request.body.mode === "raw") {
    try {
        const body = JSON.parse(pm.request.body.raw);
        
        // Add timestamp for idempotency if needed
        body.timestamp = new Date().toISOString();
        
        // Update the request body
        pm.request.body.raw = JSON.stringify(body);
    } catch (e) {
        console.error("Error parsing request body:", e);
    }
}

// 4. LOGGING
console.log("Executing request:", pm.request.url.toString());
console.log("With method:", pm.request.method);
```

## Important Considerations

1. **Error Handling**: Always include try-catch blocks for operations that might fail
2. **Idempotency**: For POST/PUT requests, consider adding timestamps or unique identifiers
3. **Cleanup**: Remove temporary variables that won't be needed after the request
4. **Logging**: Use console.log statements to document what the script is doing

## Implementation Guidelines

1. All scripts should follow the section structure outlined in the template
2. Scripts should be minimal and focused on the specific needs of the request
3. Reuse environment variables where appropriate
4. Comment your code to explain complex operations
