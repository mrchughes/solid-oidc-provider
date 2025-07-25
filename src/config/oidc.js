const fs = require('fs');
const path = require('path');
const config = require('./index');
const userService = require('../services/user');

// Define the configuration without a jwks property - let the provider generate keys
const configuration = {
    // OIDC Provider configuration
    claims: {
        // OpenID Connect standard claims
        openid: ['sub'],
        email: ['email', 'email_verified'],
        profile: ['name', 'family_name', 'given_name', 'preferred_username'],
        // Solid OIDC specific claims
        webid: ['webid'],
    },

    // Enable basic client registration
    clientRegistration: {
        // Allow dynamic client registration
        initialAccessToken: false,
    },

    // Configure features
    features: {
        devInteractions: { enabled: false },
        deviceFlow: { enabled: true },
        introspection: { enabled: true },
        revocation: { enabled: true },
        resourceIndicators: { enabled: true },
        registration: { enabled: true },
        registrationManagement: { enabled: true },
        clientCredentials: { enabled: true },
        backchannelLogout: { enabled: true },
        jwtResponseModes: { enabled: true },
        pushedAuthorizationRequests: { enabled: true },
        requestObjects: { enabled: true },
        rpInitiatedLogout: { enabled: true },
    },

    // Cookie and token configuration
    cookies: {
        keys: [process.env.COOKIE_SECRET || 'some-secure-random-key'],
        long: { signed: true, maxAge: 1 * 24 * 60 * 60 * 1000 }, // 1 day in ms
        short: { signed: true },
    },

    // JWT token configuration
    ttl: {
        AccessToken: 1 * 60 * 60, // 1 hour
        AuthorizationCode: 10 * 60, // 10 minutes
        IdToken: 1 * 60 * 60, // 1 hour
        RefreshToken: 1 * 24 * 60 * 60, // 1 day
        DeviceCode: 10 * 60, // 10 minutes
    },

    // Token formats
    formats: {
        AccessToken: 'jwt',
        ClientCredentials: 'jwt',
    },

    // Custom scopes 
    scopes: [
        'openid',
        'email',
        'profile',
        'webid',
        'offline_access',
    ],

    // Custom claims
    extraTokenClaims: async (ctx, token) => {
        const { accountId } = token;

        // For tokens with accountId, fetch the WebID and add it as a claim
        if (accountId) {
            try {
                const user = await userService.getUserById(accountId);
                if (user && user.webid) {
                    return {
                        webid: user.webid,
                    };
                }
            } catch (error) {
                console.error('Error fetching WebID for token:', error);
            }
        }

        return {};
    },
};

// Export the configuration
module.exports = configuration;
