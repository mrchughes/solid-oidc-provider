/**
 * Main configuration for the Solid OIDC Provider
 */

const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Load configuration from local-env.json if available
let localEnv = {};
try {
    const localEnvPath = path.join(__dirname, '..', '..', 'local-env.json');
    if (fs.existsSync(localEnvPath)) {
        localEnv = require(localEnvPath);
    }
} catch (error) {
    console.warn('Failed to load local-env.json:', error.message);
}

// Merge environment variables with local configuration
const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || localEnv.PORT || '3001', 10),
    issuer: process.env.ISSUER || localEnv.ISSUER || 'http://localhost:3001',
    cookieSecret: process.env.COOKIE_SECRET || localEnv.COOKIE_SECRET || 'solid_oidc_dev_cookie_secret',

    // JWT keys
    keys: {
        private: fs.readFileSync(path.join(__dirname, '..', '..', 'keys', 'private.key')),
        public: fs.readFileSync(path.join(__dirname, '..', '..', 'keys', 'public.key')),
    },

    // Security settings
    security: {
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        maxFailedLogins: 5,
        lockoutTime: 15 * 60 * 1000, // 15 minutes
        passwordResetExpiry: 24 * 60 * 60 * 1000, // 24 hours
    },

    // Email settings
    email: {
        from: process.env.EMAIL_FROM || localEnv.EMAIL_FROM || 'noreply@example.com',
        transport: {
            host: process.env.EMAIL_HOST || localEnv.EMAIL_HOST || 'smtp.example.com',
            port: parseInt(process.env.EMAIL_PORT || localEnv.EMAIL_PORT || '587', 10),
            secure: (process.env.EMAIL_SECURE || localEnv.EMAIL_SECURE || 'false') === 'true',
            auth: {
                user: process.env.EMAIL_USER || localEnv.EMAIL_USER || '',
                pass: process.env.EMAIL_PASS || localEnv.EMAIL_PASS || '',
            },
        },
    },
};

module.exports = config;
