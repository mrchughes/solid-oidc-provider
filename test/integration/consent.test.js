const request = require('supertest');
const express = require('express');
const { Provider } = require('oidc-provider');

// Create a test app with only the consent routes
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock the OIDC provider
jest.mock('oidc-provider', () => {
    return {
        Provider: jest.fn().mockImplementation(() => {
            return {
                callback: jest.fn(() => (req, res, next) => next()),
                interactionDetails: jest.fn(async () => ({
                    uid: 'test-interaction-uid',
                    params: {
                        client_id: 'test-client',
                        redirect_uri: 'https://client.example.org/callback',
                        response_type: 'code',
                        scope: 'openid profile email webid',
                    },
                    prompt: {
                        name: 'consent',
                        details: {
                            scopes: ['openid', 'profile', 'email', 'webid'],
                            claims: ['sub', 'email', 'webid'],
                        },
                    },
                })),
                interactionFinished: jest.fn(async () => { }),
                Client: {
                    find: jest.fn(async (clientId) => {
                        if (clientId === 'test-client') {
                            return {
                                clientId: 'test-client',
                                clientName: 'Test Client',
                                clientUri: 'https://client.example.org',
                                logoUri: 'https://client.example.org/logo.png',
                                redirectUris: ['https://client.example.org/callback'],
                                tosUri: 'https://client.example.org/tos',
                                policyUri: 'https://client.example.org/privacy',
                            };
                        }
                        return null;
                    }),
                },
            };
        }),
    };
});

// Mock session middleware
jest.mock('../../src/middleware/auth', () => ({
    isAuthenticated: (req, res, next) => {
        req.user = {
            id: 'test-id',
            email: 'login@example.com',
            webid: 'https://example.com/profile/login@example.com#me',
        };
        next();
    },
}));

// Mock the flash middleware
jest.mock('../../src/middleware/flash', () => ({
    flash: (req, res, next) => {
        req.flash = jest.fn();
        res.locals.flash = {};
        next();
    },
}));

// Now require routes after mocks are set up
const consentRoutes = require('../../src/routes/consent');
app.use('/interaction', consentRoutes);

describe('Consent API', () => {
    describe('GET /interaction/:uid/consent', () => {
        it('should render the consent page', async () => {
            const res = await request(app)
                .get('/interaction/test-interaction-uid/consent');

            expect(res.statusCode).toEqual(200);
            // This is a simplified test since we're not rendering the actual view
            // In a real test we would check for HTML content
        });

        it('should handle missing interaction', async () => {
            // Change the mock to return null
            const originalInteractionDetails = Provider.mock.results[0].value.interactionDetails;
            Provider.mock.results[0].value.interactionDetails = jest.fn().mockRejectedValue(new Error('Interaction not found'));

            const res = await request(app)
                .get('/interaction/missing-uid/consent');

            expect(res.statusCode).toEqual(400);

            // Restore the original mock
            Provider.mock.results[0].value.interactionDetails = originalInteractionDetails;
        });
    });

    describe('POST /interaction/:uid/consent', () => {
        it('should accept consent', async () => {
            const res = await request(app)
                .post('/interaction/test-interaction-uid/consent')
                .send({ confirm: 'yes' });

            expect(res.statusCode).toEqual(302); // Redirect
        });

        it('should reject consent', async () => {
            const res = await request(app)
                .post('/interaction/test-interaction-uid/consent')
                .send({ confirm: 'no' });

            expect(res.statusCode).toEqual(302); // Redirect
        });
    });
});
