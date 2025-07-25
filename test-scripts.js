/**
 * Test script for the Solid OIDC Provider endpoints
 * This script validates responses and extracts important data
 */

// Common validation for all responses
pm.test("Response has correct content type", function () {
    if (pm.response.headers.get("Content-Type")) {
        if (pm.response.headers.get("Content-Type").includes("application/json")) {
            pm.response.to.be.json;
        } else if (pm.response.headers.get("Content-Type").includes("text/html")) {
            pm.response.to.be.html;
        }
    }
});

// Validate OpenID Configuration
if (pm.request.url.toString().includes("/.well-known/openid-configuration")) {
    pm.test("OpenID Configuration contains required endpoints", function () {
        const jsonData = pm.response.json();
        pm.expect(jsonData).to.have.property("issuer");
        pm.expect(jsonData).to.have.property("authorization_endpoint");
        pm.expect(jsonData).to.have.property("token_endpoint");
        pm.expect(jsonData).to.have.property("userinfo_endpoint");
        pm.expect(jsonData).to.have.property("jwks_uri");
        pm.expect(jsonData).to.have.property("registration_endpoint");

        // Store endpoints for subsequent requests
        pm.environment.set("issuer", jsonData.issuer);
        pm.environment.set("authorization_endpoint", jsonData.authorization_endpoint);
        pm.environment.set("token_endpoint", jsonData.token_endpoint);
        pm.environment.set("userinfo_endpoint", jsonData.userinfo_endpoint);
        pm.environment.set("jwks_uri", jsonData.jwks_uri);
        pm.environment.set("registration_endpoint", jsonData.registration_endpoint);
    });

    pm.test("OpenID Configuration supports required features", function () {
        const jsonData = pm.response.json();
        pm.expect(jsonData.response_types_supported).to.include("code");
        pm.expect(jsonData.grant_types_supported).to.include("authorization_code");
        pm.expect(jsonData.scopes_supported).to.include("openid");
        pm.expect(jsonData.scopes_supported).to.include("webid");
    });
}

// Validate JWKS endpoint
if (pm.request.url.toString().includes("jwks_uri") || pm.request.url.toString().includes("jwks.json")) {
    pm.test("JWKS contains valid keys", function () {
        const jsonData = pm.response.json();
        pm.expect(jsonData).to.have.property("keys");
        pm.expect(jsonData.keys).to.be.an("array").that.is.not.empty;

        // Check first key has required properties
        const key = jsonData.keys[0];
        pm.expect(key).to.have.property("kid");
        pm.expect(key).to.have.property("kty");
        pm.expect(key).to.have.property("use");
        pm.expect(key).to.have.property("alg");
    });
}

// Validate client registration
if (pm.request.url.toString().includes("/register") && pm.request.method === "POST") {
    if (pm.response.code === 201) {
        pm.test("Client registration successful", function () {
            const jsonData = pm.response.json();
            pm.expect(jsonData).to.have.property("client_id");
            pm.expect(jsonData).to.have.property("client_secret");

            // Store client credentials
            pm.environment.set("client_id", jsonData.client_id);
            pm.environment.set("client_secret", jsonData.client_secret);

            if (jsonData.redirect_uris && jsonData.redirect_uris.length > 0) {
                pm.environment.set("redirect_uri", jsonData.redirect_uris[0]);
            }
        });
    }
}

// Validate user registration
if (pm.request.url.toString().includes("/register") && pm.request.method === "POST") {
    if (pm.response.code === 201) {
        pm.test("User registration successful", function () {
            const jsonData = pm.response.json();
            pm.expect(jsonData).to.have.property("id");
            pm.expect(jsonData).to.have.property("email");

            if (jsonData.webid) {
                pm.test("WebID format is valid", function () {
                    pm.expect(jsonData.webid).to.match(/^https?:\/\/.+/);
                });
                pm.environment.set("webid", jsonData.webid);
            }

            pm.environment.set("user_id", jsonData.id);
        });
    }
}

// Validate authorization response
if (pm.request.url.toString().includes("/callback") || pm.response.headers.get("Location")) {
    pm.test("Authorization response contains code", function () {
        // Check if we have a location header (redirect)
        if (pm.response.headers.get("Location")) {
            const location = pm.response.headers.get("Location");
            const url = new URL(location);
            const code = url.searchParams.get("code");
            const state = url.searchParams.get("state");

            if (code) {
                pm.environment.set("auth_code", code);
                console.log("Extracted authorization code: " + code);
            }

            // Verify state matches what we sent
            if (state && pm.environment.get("auth_state")) {
                pm.expect(state).to.equal(pm.environment.get("auth_state"));
            }
        }
    });
}

// Validate token response
if (pm.request.url.toString().includes("/token")) {
    if (pm.response.code === 200) {
        pm.test("Token response contains required tokens", function () {
            const jsonData = pm.response.json();
            pm.expect(jsonData).to.have.property("access_token");
            pm.expect(jsonData).to.have.property("token_type");
            pm.expect(jsonData).to.have.property("expires_in");

            // Store tokens
            pm.environment.set("access_token", jsonData.access_token);
            if (jsonData.id_token) {
                pm.environment.set("id_token", jsonData.id_token);

                // Decode and validate ID token
                const parts = jsonData.id_token.split('.');
                if (parts.length === 3) {
                    try {
                        // Base64 decode and parse
                        const payload = JSON.parse(atob(parts[1]));

                        pm.test("ID token contains required claims", function () {
                            pm.expect(payload).to.have.property("iss");
                            pm.expect(payload).to.have.property("sub");
                            pm.expect(payload).to.have.property("aud");
                            pm.expect(payload).to.have.property("exp");
                            pm.expect(payload).to.have.property("iat");

                            if (pm.environment.get("auth_nonce")) {
                                pm.expect(payload).to.have.property("nonce").to.equal(pm.environment.get("auth_nonce"));
                            }
                        });

                        // Check for Solid OIDC specific claims
                        pm.test("ID token contains Solid OIDC claims", function () {
                            if (payload.webid) {
                                pm.expect(payload.webid).to.match(/^https?:\/\/.+/);
                                pm.environment.set("webid", payload.webid);
                            }
                        });
                    } catch (e) {
                        console.error("Error parsing ID token:", e);
                    }
                }
            }

            if (jsonData.refresh_token) {
                pm.environment.set("refresh_token", jsonData.refresh_token);
            }
        });
    }
}

// Validate userinfo response
if (pm.request.url.toString().includes("/userinfo")) {
    if (pm.response.code === 200) {
        pm.test("Userinfo contains required claims", function () {
            const jsonData = pm.response.json();
            pm.expect(jsonData).to.have.property("sub");

            // Check for WebID claim - required for Solid OIDC
            if (jsonData.webid) {
                pm.test("WebID is properly formatted", function () {
                    pm.expect(jsonData.webid).to.be.a("string");
                    pm.expect(jsonData.webid).to.match(/^https?:\/\/.+/);
                });

                // Store WebID for subsequent requests
                pm.environment.set("webid", jsonData.webid);
            }
        });
    }
}

// Log response time for performance monitoring
console.log("Response time: " + pm.response.responseTime + " ms");

// If any tests failed, log them for easier debugging
const failedTests = pm.test.allTests.filter(test => !test.passed);
if (failedTests.length > 0) {
    console.log("Failed tests: ", failedTests.map(test => test.name));
}
