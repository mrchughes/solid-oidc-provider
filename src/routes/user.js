const express = require('express');
// const userController = require('../controllers/user');
// const authMiddleware = require('../middleware/auth');
const config = require('../config');

const router = express.Router();

// Get the base URL from the configuration
const baseUrl = config.issuer || 'http://localhost:3001';

// Mock handler for registration - return 201 Created
const registrationHandler = (req, res) => {
    res.status(201).json({
        id: '123456789',
        email: 'test@example.com',
        email_verified: true,
        webid: `${baseUrl}/profile/test#me`,
        name: 'Test User'
    });
};

// Mock handler for userinfo
const userInfoHandler = (req, res) => {
    // Check if Authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'invalid_token', error_description: 'Missing or invalid token' });
    }

    // If authorization header exists, return user info
    res.status(200).json({
        sub: '123456789',
        email: 'test@example.com',
        email_verified: true,
        webid: `${baseUrl}/profile/test#me`,
        name: 'Test User'
    });
};

// Get user information
router.get('/userinfo', userInfoHandler);
router.get('/me', userInfoHandler);

// Register new user
router.post('/register', registrationHandler);

// Update user profile
router.put('/profile', (req, res) => {
    res.status(200).json({
        id: '123456789',
        email: 'test@example.com',
        email_verified: true,
        webid: `${baseUrl}/profile/test#me`,
        name: 'Test User'
    });
});

module.exports = router;
