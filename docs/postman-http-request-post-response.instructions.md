# Postman HTTP Request Post-Response Scripts

This document outlines the standard patterns and practices for post-response scripts in the Solid OIDC Provider Postman collection.

## Purpose

Post-response scripts execute after receiving a response from the server. They help with:

1. Testing the response status and content
2. Extracting and storing data from responses
3. Validating response against schema
4. Setting up data for subsequent requests

## Standard Script Template

```javascript
// 1. STATUS CODE VALIDATION
pm.test("Status code is successful", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201, 202, 204]);
});

// 2. RESPONSE TIME VALIDATION
pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// 3. RESPONSE BODY VALIDATION
// Skip if response is empty
if (pm.response.text()) {
    pm.test("Response has valid structure", function () {
        try {
            const jsonData = pm.response.json();
            
            // Basic structure validation
            if (pm.request.url.toString().includes("/auth/")) {
                pm.expect(jsonData).to.have.property("access_token");
                pm.expect(jsonData).to.have.property("token_type");
            }
            
            // Schema validation could be added here
            
        } catch (e) {
            pm.expect.fail("Invalid JSON response: " + e.message);
        }
    });
}

// 4. VARIABLE EXTRACTION
// Extract variables from response for use in subsequent requests
if (pm.response.text()) {
    try {
        const jsonData = pm.response.json();
        
        // Authentication endpoints
        if (jsonData.access_token) {
            pm.environment.set("access_token", jsonData.access_token);
            console.log("Access token stored for subsequent requests");
        }
        
        // Registration endpoints
        if (jsonData.id) {
            pm.environment.set("user_id", jsonData.id);
            console.log("User ID stored:", jsonData.id);
        }
        
    } catch (e) {
        console.error("Error processing response:", e);
    }
}

// 5. LOGGING
console.log("Response received with status:", pm.response.code);
console.log("Response time:", pm.response.responseTime, "ms");
```

## Important Considerations

1. **Error Handling**: Always include try-catch blocks for operations that might fail
2. **Test Naming**: Use clear and descriptive names for your tests
3. **Variable Management**: Set environment variables for data needed in subsequent requests
4. **Performance Monitoring**: Include response time tests for critical endpoints

## Implementation Guidelines

1. All scripts should follow the section structure outlined in the template
2. Each test should focus on a single aspect of the response
3. Use pm.environment.set() to store data needed for subsequent requests
4. Use console.log() for important information, but don't overuse it
5. Tests should be independent of each other where possible
