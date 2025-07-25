# Postman Folder Post-Response Scripts

This document outlines the standard patterns and practices for folder-level post-response scripts in the Solid OIDC Provider Postman collection.

## Purpose

Folder-level post-response scripts execute after every request in the folder. They help with:

1. Validating responses specific to the folder context
2. Aggregating data from multiple requests
3. Cleaning up folder-specific variables
4. Logging folder-level statistics

## Standard Script Template

```javascript
// 1. IDENTIFY FOLDER CONTEXT
// Get the current folder name
const folderName = pm.info.requestName.split("/")[0]; // This is an approximation
console.log("Executing folder post-response script for:", folderName);

// 2. FOLDER-SPECIFIC VALIDATION
// Validate responses based on folder context
if (folderName.includes("Authentication")) {
    // Track authentication success/failure
    if (pm.response.code === 200 && pm.response.json().access_token) {
        pm.environment.set("auth_success", true);
        console.log("Authentication successful");
    } else if (pm.response.code >= 400) {
        pm.environment.set("auth_failures", (pm.environment.get("auth_failures") || 0) + 1);
        console.error("Authentication failed:", pm.response.code);
    }
} else if (folderName.includes("User Profile")) {
    // Track profile update success/failure
    if (pm.response.code === 200 || pm.response.code === 201) {
        pm.environment.set("profile_updated", true);
        console.log("Profile update successful");
    }
}

// 3. DATA AGGREGATION
// Aggregate data from multiple requests in the folder
const folderStats = pm.environment.get("folder_stats") || {};
if (!folderStats[folderName]) {
    folderStats[folderName] = {
        requests: 0,
        successes: 0,
        failures: 0,
        total_time: 0
    };
}

folderStats[folderName].requests += 1;
if (pm.response.code >= 200 && pm.response.code < 300) {
    folderStats[folderName].successes += 1;
} else if (pm.response.code >= 400) {
    folderStats[folderName].failures += 1;
}
folderStats[folderName].total_time += pm.response.responseTime;
folderStats[folderName].avg_time = folderStats[folderName].total_time / folderStats[folderName].requests;

pm.environment.set("folder_stats", folderStats);

// 4. CLEANUP
// Clean up folder-specific temporary variables when the last request in the folder completes
// This requires knowledge of how many requests are in the folder, which is challenging to determine dynamically
// This is a simplified approach based on naming conventions
const isLastRequest = pm.request.url.toString().includes("last") || pm.request.name.includes("Last");
if (isLastRequest) {
    console.log("Cleaning up folder-specific variables for:", folderName);
    
    // Clean up folder-specific variables
    if (folderName.includes("Authentication")) {
        // Only clean up temporary variables, not important state
        pm.environment.unset("temp_auth_state");
    }
}

// 5. LOGGING
console.log(`Folder stats for ${folderName}:`, folderStats[folderName]);
```

## Important Considerations

1. **Context-Based Validation**: Validate responses based on the folder's logical grouping
2. **Data Collection**: Aggregate data to understand patterns across related requests
3. **Cleanup Timing**: Cleaning up at the right time can be challenging with Postman's execution model
4. **State Maintenance**: Be careful not to clean up variables still needed by other folders

## Implementation Guidelines

1. Folder-level scripts should focus on the collective behavior of requests in the folder
2. Use descriptive names for aggregated statistics
3. Be cautious with cleanup to avoid removing variables needed by other requests
4. Consider the sequence of requests when aggregating data
5. Provide meaningful logs that help understand the behavior of the folder as a whole
