/**
 * Session timeout middleware
 * Implements session idle timeout after a period of inactivity
 */

const config = require('../config/index');

module.exports = function sessionTimeout(req, res, next) {
    // Skip for certain paths
    const excludedPaths = [
        '/auth/extend-session',
        '/session-timeout',
        '/session-expired',
        '/login',
        '/logout',
        '/register',
        '/auth/reset',
        '/.well-known/openid-configuration',
        '/jwks'
    ];

    if (excludedPaths.some(path => req.path.startsWith(path)) || req.path.startsWith('/assets/')) {
        return next();
    }

    // If user is not authenticated, no need to check timeout
    if (!req.session || !req.session.user) {
        return next();
    }

    const currentTime = Date.now();
    const lastActive = req.session.lastActive || currentTime;
    const idleTime = currentTime - lastActive;
    const idleTimeout = config.server.sessionDuration;

    // If idle time exceeds timeout, redirect to session expired page
    if (idleTime > idleTimeout) {
        req.session.destroy(() => {
            return res.redirect('/session-expired');
        });
        return;
    }

    // If idle time is approaching timeout (e.g., 5 minutes before), redirect to warning page
    const warningThreshold = 5 * 60 * 1000; // 5 minutes
    if (idleTime > (idleTimeout - warningThreshold)) {
        // Store original URL to redirect back after extending session
        req.session.returnTo = req.originalUrl;
        return res.redirect('/session-timeout');
    }

    // Update last active timestamp
    req.session.lastActive = currentTime;
    next();
};
