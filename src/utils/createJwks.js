const fs = require('fs');
const path = require('path');
const { createPrivateKey } = require('crypto');
const jose = require('jose');

/**
 * Creates a JWKS (JSON Web Key Set) from an existing RSA private key
 * @returns {Object} JWKS object with RSA key
 */
async function createJwksFromKey() {
    try {
        // Read the private key file
        const privateKeyPath = path.join(__dirname, '../../keys/private.key');
        const privateKeyData = fs.readFileSync(privateKeyPath, 'utf8');

        // Create a private key from the PEM data
        const privateKey = createPrivateKey(privateKeyData);

        // Convert to JWK format
        const jwk = await jose.exportJWK(privateKey);

        // Add required properties for JWKS
        jwk.kid = 'sig-key-1';
        jwk.use = 'sig';
        jwk.alg = 'RS256';

        // Return as JWKS format
        return {
            keys: [jwk]
        };
    } catch (error) {
        console.error('Error creating JWKS:', error);
        throw error;
    }
}

module.exports = { createJwksFromKey };
