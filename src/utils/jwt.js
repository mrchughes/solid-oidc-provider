const jwt = require('jsonwebtoken');
const config = require('../config');

// Generate JWT token
exports.generateToken = (payload, expiresIn = '1h') => {
    const { privateKey } = config.jwtKeys();

    return jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn,
    });
};

// Verify JWT token
exports.verifyToken = (token) => {
    const { publicKey } = config.jwtKeys();

    return jwt.verify(token, publicKey);
};

// Generate a secure random string
exports.generateRandomString = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
};
