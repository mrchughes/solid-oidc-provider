const express = require('express');
const consentController = require('../controllers/consent');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get client consents
router.get('/', authMiddleware.authenticate, consentController.getConsents);

// Store client consent
router.post('/', authMiddleware.authenticate, consentController.storeConsent);

// Revoke client consent
router.delete('/:clientId', authMiddleware.authenticate, consentController.revokeConsent);

// Check client consent
router.get('/check', authMiddleware.authenticate, consentController.checkConsent);

module.exports = router;
