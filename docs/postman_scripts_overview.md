# Postman Scripts in Solid OIDC Provider

This document provides an overview of the Postman scripting guidelines for the Solid OIDC Provider service.

## Available Instruction Files

We've created the following instruction files to guide the development of Postman scripts:

| Level | Script Type | Instruction File |
|-------|-------------|------------------|
| Collection | Pre-Request | [postman-collections-pre-request.instructions.md](./postman-collections-pre-request.instructions.md) |
| Collection | Post-Response | [postman-collections-post-response.instructions.md](./postman-collections-post-response.instructions.md) |
| Folder | Pre-Request | [postman-folder-pre-request.instructions.md](./postman-folder-pre-request.instructions.md) |
| Folder | Post-Response | [postman-folder-post-response.instructions.md](./postman-folder-post-response.instructions.md) |
| Request | Pre-Request | [postman-http-request-pre-request.instructions.md](./postman-http-request-pre-request.instructions.md) |
| Request | Post-Response | [postman-http-request-post-response.instructions.md](./postman-http-request-post-response.instructions.md) |

## How to Use These Instructions

1. When creating or modifying Postman scripts, refer to the appropriate instruction file based on:
   - The level (Collection, Folder, or Request)
   - The script type (Pre-Request or Post-Response)

2. Follow the templates and guidelines provided in each instruction file

3. Ensure your scripts adhere to the standards for:
   - Structure
   - Error handling
   - Variable management
   - Logging

## Running Postman Tests

You can run the Postman tests for this project using:

```bash
npm run test:postman
```

This will:
1. Check if Newman is installed and install it if needed
2. Verify that the server is running (and start it if it's not)
3. Run the Postman collection against the local environment
4. Report the results

## Maintaining Postman Collections

1. Keep the collection in the repository in sync with the Postman workspace
2. Follow the guidelines in [postman_scripts_guidelines.md](./postman_scripts_guidelines.md) for script development
3. Document any environment variables required for the collection
4. Ensure scripts are compatible with both the Postman app and Newman CLI

## Script Examples

### Pre-request Script Example

```javascript
// Generate a random user email for registration
pm.environment.set("user_email", "test_" + Math.random().toString(36).substring(2, 8) + "@example.com");

// Generate a secure password
pm.environment.set("user_password", "Password" + Math.floor(Math.random() * 1000) + "!");

// Set current timestamp
pm.environment.set("timestamp", new Date().toISOString());
```

### Test Script Example

```javascript
// Check status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Validate response structure
pm.test("Response has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("id");
    pm.expect(jsonData).to.have.property("webid");
    pm.expect(jsonData.email).to.eql(pm.environment.get("user_email"));
});

// Store data for subsequent requests
const jsonData = pm.response.json();
pm.environment.set("user_id", jsonData.id);
pm.environment.set("access_token", jsonData.access_token);
```

## Best Practices

1. **Use Environment Variables**: Store data that needs to be reused in environment variables
2. **Handle Errors Gracefully**: Use try/catch blocks for error handling
3. **Keep Scripts Focused**: Each script should have a clear purpose
4. **Add Comments**: Document your scripts, especially for complex operations
5. **Use Console Logging**: Add console.log statements for debugging
6. **Verify Before Using**: Always check if a variable exists before using it

## Testing the Solid OIDC Provider API

When testing the Solid OIDC Provider API, follow this workflow:

1. **Discovery**: Test the OIDC discovery endpoint first
2. **Registration**: Register a client application
3. **User Management**: Create and authenticate users
4. **Authorization**: Test the authorization flow
5. **Token Exchange**: Verify token issuance and validation
6. **Resource Access**: Test protected resource access

For running the tests with a summary report:

```bash
npm run test:postman:summary
```

## Further Reading

- [Postman Scripting Documentation](https://learning.postman.com/docs/writing-scripts/intro-to-scripts/)
- [Postman Test Examples](https://learning.postman.com/docs/writing-scripts/test-scripts/)
- [Solid OIDC Specification](https://solid.github.io/authentication-panel/solid-oidc/)
- [Implementation Details](./postman_testing_implementation.md)
