# Postman Collection Post-Response Scripts

This document outlines the standard patterns and practices for collection-level post-response scripts in the Solid OIDC Provider Postman collection.

## Purpose

Collection-level post-response scripts execute after every request in the collection. They help with:

1. Logging response statistics
2. Monitoring for common errors
3. Validating common response patterns
4. Cleaning up temporary variables

## Standard Script Template

```javascript
// 1. RESPONSE LOGGING
// Log basic information about the response
const endpoint = pm.request.url.toString().replace(pm.environment.get("base_url"), "");
console.log(`Response from ${endpoint}: ${pm.response.code} (${pm.response.responseTime}ms)`);

// 2. ERROR MONITORING
// Check for error responses and log them
if (pm.response.code >= 400) {
    console.error(`Error ${pm.response.code} from ${endpoint}:`, pm.response.text());
    
    // Track error count
    const errorCount = pm.globals.get("error_count") || 0;
    pm.globals.set("error_count", errorCount + 1);
    
    // Store most recent error
    pm.globals.set("last_error", {
        endpoint: endpoint,
        status: pm.response.code,
        message: pm.response.text(),
        timestamp: new Date().toISOString()
    });
}

// 3. STATISTICS TRACKING
// Track response times for performance monitoring
const stats = pm.globals.get("response_stats") || {
    count: 0,
    total_time: 0,
    min_time: Number.MAX_SAFE_INTEGER,
    max_time: 0
};

stats.count += 1;
stats.total_time += pm.response.responseTime;
stats.min_time = Math.min(stats.min_time, pm.response.responseTime);
stats.max_time = Math.max(stats.max_time, pm.response.responseTime);
stats.avg_time = stats.total_time / stats.count;

pm.globals.set("response_stats", stats);

// 4. CLEANUP
// Remove any temporary variables that aren't needed anymore
// This is especially important for large request bodies or responses
if (pm.globals.get("temp_request_body")) {
    pm.globals.unset("temp_request_body");
}
```

## Important Considerations

1. **Performance Impact**: Collection scripts run for every request, so keep them lightweight
2. **Debugging**: Collection-level logging helps identify issues across multiple requests
3. **Statistics**: Tracking metrics helps identify performance issues over time
4. **Error Patterns**: Collecting error information helps identify common failure patterns

## Implementation Guidelines

1. Focus on collecting information rather than acting on it
2. Use clear logging to help with debugging collection runs
3. Consider storing statistics for later analysis
4. Clean up temporary variables to avoid cluttering the environment
5. Avoid making HTTP requests in collection scripts as this can cause unexpected behavior
