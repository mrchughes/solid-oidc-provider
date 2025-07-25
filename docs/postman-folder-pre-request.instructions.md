# Postman Folder Pre-Request Scripts

This document outlines the standard patterns and practices for folder-level pre-request scripts in the Solid OIDC Provider Postman collection.

## Purpose

Folder-level pre-request scripts execute before any request in the folder is sent. They help with:

1. Folder-specific variable initialization
2. Setting up context for a group of related requests
3. Preparing data needed for all requests in the folder
4. Logging folder-level information

## Standard Script Template

```javascript
// 1. IDENTIFY FOLDER CONTEXT
// Get the current folder name
const folderName = pm.info.requestName.split("/")[0]; // This is an approximation
console.log("Executing folder pre-request script for:", folderName);

// 2. FOLDER-SPECIFIC VARIABLE INITIALIZATION
// Initialize variables specific to this folder's context
if (folderName.includes("Authentication")) {
    // Authentication-specific setup
    if (!pm.environment.get("test_username")) {
        pm.environment.set("test_username", "test_user_" + Math.random().toString(36).substring(2, 8));
    }
    if (!pm.environment.get("test_password")) {
        pm.environment.set("test_password", "Test" + Math.random().toString(36).substring(2, 10) + "!");
    }
} else if (folderName.includes("User Profile")) {
    // User profile-specific setup
    if (!pm.environment.get("profile_updated_at")) {
        pm.environment.set("profile_updated_at", new Date().toISOString());
    }
}

// 3. COMMON DATA PREPARATION
// Prepare data needed for all requests in this folder
if (folderName.includes("OIDC")) {
    // OIDC-specific data
    if (!pm.environment.get("code_verifier")) {
        // Generate a code verifier for PKCE
        const codeVerifier = Array(43).fill(0).map(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"[Math.floor(Math.random() * 65)]).join('');
        pm.environment.set("code_verifier", codeVerifier);
        
        // Generate code challenge
        const getCryptoJS = () => {
            try {
                return require('crypto-js');
            } catch (err) {
                console.error('crypto-js is not available');
                return null;
            }
        };
        
        const cryptoJS = getCryptoJS();
        if (cryptoJS) {
            const codeChallenge = cryptoJS.SHA256(codeVerifier)
                .toString(cryptoJS.enc.Base64)
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
            pm.environment.set("code_challenge", codeChallenge);
        }
    }
}

// 4. LOGGING
console.log("Folder pre-request script executed for:", folderName);
```

## Important Considerations

1. **Folder Scope**: Variables set here should be relevant to all requests in the folder
2. **Efficiency**: Reuse variables set at the collection level when appropriate
3. **Context**: Consider the logical grouping of requests in the folder when setting up variables
4. **Cleanup**: Clean up folder-specific variables in the folder's post-response script

## Implementation Guidelines

1. Folder-level scripts should focus on the specific context of the folder
2. Use descriptive variable names that indicate they are specific to a folder
3. Document any folder-level variables created for use in request scripts
4. Handle potential errors when generating or processing data
