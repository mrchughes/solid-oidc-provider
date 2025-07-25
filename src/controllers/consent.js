const userService = require('../services/user');

// Get client consents
exports.getConsents = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const consents = userService.getUserConsents(userId);

        return res.status(200).json(consents);
    } catch (error) {
        console.error('Get consents error:', error);
        return res.status(500).json({ error: 'Failed to get user consents' });
    }
};

// Store client consent
exports.storeConsent = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { clientId, scopes } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!clientId || !scopes) {
            return res.status(400).json({ error: 'Client ID and scopes are required' });
        }

        userService.storeClientConsent(userId, clientId, scopes);

        return res.status(200).json({ message: 'Consent stored successfully' });
    } catch (error) {
        console.error('Store consent error:', error);
        return res.status(500).json({ error: 'Failed to store consent' });
    }
};

// Revoke client consent
exports.revokeConsent = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { clientId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!clientId) {
            return res.status(400).json({ error: 'Client ID is required' });
        }

        const removed = userService.removeClientConsent(userId, clientId);

        if (!removed) {
            return res.status(404).json({ error: 'Consent not found' });
        }

        return res.status(200).json({ message: 'Consent revoked successfully' });
    } catch (error) {
        console.error('Revoke consent error:', error);
        return res.status(500).json({ error: 'Failed to revoke consent' });
    }
};

// Check client consent
exports.checkConsent = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { clientId, scopes } = req.query;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!clientId) {
            return res.status(400).json({ error: 'Client ID is required' });
        }

        const hasConsent = userService.hasClientConsent(
            userId,
            clientId,
            scopes ? scopes.split(' ') : null
        );

        return res.status(200).json({ hasConsent });
    } catch (error) {
        console.error('Check consent error:', error);
        return res.status(500).json({ error: 'Failed to check consent' });
    }
};
