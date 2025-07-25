/**
 * Pre-request script for authentication requests in the Solid OIDC Provider
 * This script prepares the environment for authentication flows
 */

// Check and initialize base URL
if (!pm.environment.get("base_url")) {
    pm.environment.set("base_url", "http://localhost:3001");
    console.log("Set default base_url: http://localhost:3001");
}

// Generate test data for new user registration if needed
if (pm.request.url.toString().includes("/register") && !pm.environment.get("test_email")) {
    const randomId = pm.variables.replaceIn('{{$randomUUID}}');
    const testEmail = `test-${randomId}@example.com`;
    pm.environment.set("test_email", testEmail);
    pm.environment.set("test_password", "SecurePassword123!");
    console.log(`Generated test credentials: ${testEmail}`);
}

// For login requests, ensure we have credentials
if (pm.request.url.toString().includes("/login")) {
    if (!pm.environment.get("test_email") || !pm.environment.get("test_password")) {
        console.warn("Missing test credentials for login. Please register a user first.");
    }

    // Update request body with environment variables
    try {
        const requestBody = JSON.parse(pm.request.body.raw);
        requestBody.email = pm.environment.get("test_email");
        requestBody.password = pm.environment.get("test_password");
        pm.request.body.raw = JSON.stringify(requestBody, null, 2);
    } catch (e) {
        console.error("Error updating request body:", e);
    }
}

// For authorization requests, generate state and nonce parameters
if (pm.request.url.toString().includes("/authorize")) {
    const state = pm.variables.replaceIn('{{$randomUUID}}');
    const nonce = pm.variables.replaceIn('{{$randomUUID}}');

    pm.environment.set("auth_state", state);
    pm.environment.set("auth_nonce", nonce);

    // Add or update state and nonce parameters in the URL
    const url = new URL(pm.request.url.toString());
    url.searchParams.set('state', state);
    url.searchParams.set('nonce', nonce);

    pm.request.url = url.toString();
    console.log("Added state and nonce parameters to authorization request");
}

// For token requests, ensure we have the necessary parameters
if (pm.request.url.toString().includes("/token")) {
    if (!pm.environment.get("auth_code")) {
        console.warn("Missing authorization code. Please complete authorization flow first.");
    }

    // Prepare basic auth for client credentials
    if (pm.environment.get("client_id") && pm.environment.get("client_secret")) {
        const clientId = pm.environment.get("client_id");
        const clientSecret = pm.environment.get("client_secret");
        const basicAuth = btoa(`${clientId}:${clientSecret}`);

        pm.request.headers.add({
            key: "Authorization",
            value: `Basic ${basicAuth}`
        });
        console.log("Added Basic Auth header for token request");
    }
}

// For user info requests, add access token if available
if (pm.request.url.toString().includes("/userinfo")) {
    const accessToken = pm.environment.get("access_token");
    if (accessToken) {
        pm.request.headers.add({
            key: "Authorization",
            value: `Bearer ${accessToken}`
        });
        console.log("Added Bearer token for userinfo request");
    } else {
        console.warn("Missing access token for userinfo request");
    }
}

// Log the prepared request for debugging
console.log(`Pre-request script completed for: ${pm.request.url.toString()}`);
