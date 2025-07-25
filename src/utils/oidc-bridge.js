/**
 * This file serves as a bridge between CommonJS and ESM modules.
 * It dynamically imports the ESM-only 'oidc-provider' module
 * and exports it for use in CommonJS modules.
 */

// Create a placeholder export that will be filled dynamically
let Provider;

// Function to initialize the OIDC provider
async function getProvider() {
    console.log('Attempting to load oidc-provider dynamically...');
    if (!Provider) {
        try {
            // Dynamically import the ESM module
            console.log('Starting dynamic import');
            const oidcModule = await import('oidc-provider');
            console.log('Dynamic import successful');
            Provider = oidcModule.Provider;
            console.log('Provider loaded:', !!Provider);
        } catch (error) {
            console.error('Failed to import oidc-provider:', error);
            throw error;
        }
    } else {
        console.log('Using cached Provider');
    }
    return Provider;
}

module.exports = { getProvider };
