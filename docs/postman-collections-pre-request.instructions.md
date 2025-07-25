# Postman Collection Pre-Request Scripts

This document outlines the standard patterns and practices for collection-level pre-request scripts in the Solid OIDC Provider Postman collection.

## Purpose

Collection-level pre-request scripts execute before any request in the collection is sent. They help with:

1. Global variable initialization
2. Environment setup and validation
3. Common authentication setup
4. Logging collection-level information

## Standard Script Template

```javascript
// 1. ENVIRONMENT VALIDATION
// Check if all required environment variables are set
const requiredVars = ["base_url"];
const missingVars = requiredVars.filter(v => !pm.environment.get(v));

if (missingVars.length > 0) {
    console.error("Missing required environment variables:", missingVars.join(", "));
    console.error("Please set these variables before running the collection");
}

// 2. GLOBAL VARIABLE INITIALIZATION
// Set collection-wide variables if they don't exist
if (!pm.globals.get("collection_started_at")) {
    pm.globals.set("collection_started_at", new Date().toISOString());
}

// Generate a unique identifier for this collection run
if (!pm.globals.get("collection_run_id")) {
    pm.globals.set("collection_run_id", "run_" + Date.now());
}

// 3. COMMON AUTHENTICATION SETUP
// Setup common auth headers or tokens that all/many requests will need
// This is a placeholder and should be customized based on auth requirements
if (!pm.globals.get("default_headers")) {
    pm.globals.set("default_headers", {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Request-ID": pm.globals.get("collection_run_id")
    });
}

// 4. LOGGING
console.log("Collection pre-request script executed");
console.log("Collection run ID:", pm.globals.get("collection_run_id"));
console.log("Base URL:", pm.environment.get("base_url"));
```

## Important Considerations

1. **Environment Validation**: Always check if required variables are present
2. **Global vs Environment Variables**: Use globals for collection-wide data, environment for context-specific data
3. **Performance**: Keep collection-level scripts lightweight to avoid slowing down every request
4. **Idempotency**: Make sure scripts can be run multiple times without side effects

## Implementation Guidelines

1. Collection-level scripts should focus on setup and validation
2. Avoid complex logic that might be better suited to individual request scripts
3. Document any global variables that are created for use in request scripts
4. Use clear error messages to help users understand what's missing or misconfigured
