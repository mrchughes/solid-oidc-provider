/**
 * Two-factor authentication utilities
 */

const { authenticator } = require('otplib');
const QRCode = require('qrcode');

/**
 * Generate a secret key for two-factor authentication
 * @returns {string} The generated secret key
 */
function generateSecret() {
    return authenticator.generateSecret();
}

/**
 * Generate a QR code for two-factor authentication
 * @param {string} email - User's email
 * @param {string} secret - Two-factor authentication secret
 * @param {string} issuer - Name of the issuer
 * @returns {Promise<string>} Data URL of the QR code
 */
async function generateQRCode(email, secret, issuer = 'Solid OIDC Provider') {
    const otpauth = authenticator.keyuri(email, issuer, secret);

    try {
        const qrCodeUrl = await QRCode.toDataURL(otpauth);
        return qrCodeUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
}

/**
 * Verify a two-factor authentication token
 * @param {string} token - Token to verify
 * @param {string} secret - Two-factor authentication secret
 * @returns {boolean} Whether the token is valid
 */
function verifyToken(token, secret) {
    try {
        return authenticator.verify({ token, secret });
    } catch (error) {
        console.error('Error verifying token:', error);
        return false;
    }
}

module.exports = {
    generateSecret,
    generateQRCode,
    verifyToken
};
