const express = require('express');
const userService = require('../services/user');
const { requireAuth } = require('../middleware/auth');
const config = require('../config/index');

const router = express.Router();

/**
 * Serve WebID profile document
 * This is essential for Solid OIDC compliance
 */
router.get('/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const webid = `${config.issuer}/profile/${username}#me`;
        const user = userService.findUserByWebId(webid);

        if (!user) {
            return res.status(404).send('Profile not found');
        }

        // Determine the content type based on Accept header
        const acceptHeader = req.get('Accept');
        const isTurtle = acceptHeader && acceptHeader.includes('text/turtle');

        if (isTurtle) {
            // Return Turtle format
            res.setHeader('Content-Type', 'text/turtle');
            res.send(`@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix solid: <http://www.w3.org/ns/solid/terms#> .

<${webid}>
    a foaf:Person ;
    foaf:name "${username}" ;
    solid:oidcIssuer <${config.issuer}> .
`);
        } else {
            // Return JSON-LD format
            res.setHeader('Content-Type', 'application/ld+json');
            res.json({
                "@context": {
                    "foaf": "http://xmlns.com/foaf/0.1/",
                    "solid": "http://www.w3.org/ns/solid/terms#"
                },
                "@id": webid,
                "@type": "foaf:Person",
                "foaf:name": username,
                "solid:oidcIssuer": config.issuer
            });
        }
    } catch (error) {
        console.error('Error serving WebID profile:', error);
        res.status(500).send('Error serving profile');
    }
});

/**
 * Update WebID profile (authenticated)
 */
router.put('/profile/:username', requireAuth, async (req, res) => {
    try {
        const { username } = req.params;
        const webid = `${config.issuer}/profile/${username}#me`;

        // Check if user is authorized to update this profile
        if (req.session.user.webid !== webid) {
            return res.status(403).send('Not authorized to update this profile');
        }

        // In a real implementation, this would update profile data
        // For now we just return success
        res.status(200).send('Profile updated');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('Error updating profile');
    }
});

/**
 * WebID card (for backward compatibility)
 */
router.get('/profile/:username/card', async (req, res) => {
    try {
        const { username } = req.params;
        const webid = `${config.issuer}/profile/${username}#me`;
        const user = userService.findUserByWebId(webid);

        if (!user) {
            return res.status(404).send('Profile not found');
        }

        // Always return Turtle format for card
        res.setHeader('Content-Type', 'text/turtle');
        res.send(`@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix solid: <http://www.w3.org/ns/solid/terms#> .

<${webid}>
    a foaf:Person ;
    foaf:name "${username}" ;
    solid:oidcIssuer <${config.issuer}> .
`);
    } catch (error) {
        console.error('Error serving WebID card:', error);
        res.status(500).send('Error serving profile card');
    }
});

module.exports = router;
