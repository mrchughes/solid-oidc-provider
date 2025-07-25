/**
 * CSRF Protection Middleware
 */

const crypto = require('crypto');

/**
 * Generate a CSRF token and add it to the session
 */
function generateToken(req) {
    // Generate a random token
    const token = crypto.randomBytes(32).toString('hex');

    // Store the token in the session
    req.session.csrfToken = token;

    return token;
}

/**
 * Middleware to add CSRF token to request
 */
function csrfProtection(req, res, next) {
    // Generate a new token if one doesn't exist
    if (!req.session.csrfToken) {
        req.session.csrfToken = generateToken(req);
    }

    // Add a method to get the CSRF token
    req.csrfToken = function () {
        return req.session.csrfToken;
    };

    // For POST, PUT, DELETE requests, validate the token
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        const token = req.body._csrf || req.headers['x-csrf-token'];

        if (!token || token !== req.session.csrfToken) {
            return res.status(403).render('error', {
                title: 'Forbidden',
                message: 'Invalid or missing CSRF token'
            });
        }
    }

    // Add CSRF token to all templates
    res.locals.csrfToken = req.session.csrfToken;

    next();
}

module.exports = {
    csrfProtection
};
