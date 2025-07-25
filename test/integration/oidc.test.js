const request = require('supertest');
const express = require('express');
const { Provider } = require('oidc-provider');
const jose = require('jose');

// Mock the OIDC provider used by the routes
jest.mock('oidc-provider', () => {
    return {
        Provider: jest.fn().mockImplementation(() => {
            return {
                callback: jest.fn(() => (req, res, next) => next()),
                use: jest.fn(),
                on: jest.fn(),
                proxy: jest.fn(),
                app: {
                    proxy: jest.fn(),
                    keys: [],
                },
                interactionDetails: jest.fn(async () => ({
                    uid: 'test-interaction-uid',
                    params: {
                        client_id: 'test-client',
                        redirect_uri: 'https://client.example.org/callback',
                        response_type: 'code',
                        scope: 'openid profile email webid',
                    },
                    prompt: {
                        name: 'login',
                    },
                })),
                interactionFinished: jest.fn(async () => { }),
                Client: {
                    find: jest.fn(async (clientId) => {
                        if (clientId === 'test-client') {
                            return {
                                clientId: 'test-client',
                                clientSecret: 'test-secret',
                                redirectUris: ['https://client.example.org/callback'],
                                responseTypes: ['code'],
                                grantTypes: ['authorization_code', 'refresh_token'],
                            };
                        }
                        return null;
                    }),
                },
                clients: {
                    add: jest.fn(async (clientData) => {
                        return {
                            client_id: 'test-client',
                            client_secret: 'test-secret',
                            ...clientData,
                        };
                    }),
                },
                issueAccessToken: jest.fn(async () => 'mock-access-token'),
                issueIdToken: jest.fn(async () => 'mock-id-token'),
                issueRefreshToken: jest.fn(async () => 'mock-refresh-token'),
                jwks: jest.fn(async () => ({
                    keys: [
                        {
                            kty: 'RSA',
                            kid: 'test-key-id',
                            alg: 'RS256',
                            use: 'sig',
                            n: 'test-modulus',
                            e: 'AQAB',
                        },
                    ],
                })),
            };
        }),
    };
});

// Mock the user service
jest.mock('../../src/services/user', () => ({
    createUser: jest.fn((email, password) => ({
        id: 'test-id',
        email,
        password,
        webid: `https://example.com/profile/${email}#me`,
    })),
    findUserByEmail: jest.fn((email) => {
        if (email === 'login@example.com') {
            return {
                id: 'test-id',
                email,
                password: 'password123',
                webid: `https://example.com/profile/${email}#me`,
            };
        }
        return null;
    }),
    validatePassword: jest.fn((user, password) => {
        return password === 'password123';
    }),
    getUserById: jest.fn((id) => {
        if (id === 'test-id') {
            return {
                id: 'test-id',
                email: 'login@example.com',
                webid: 'https://example.com/profile/login@example.com#me',
            };
        }
        return null;
    }),
    resetPasswordRequest: jest.fn(async (email) => {
        if (email === 'login@example.com') {
            return { token: 'reset-token-123' };
        }
        throw new Error('User not found');
    }),
    resetPassword: jest.fn(async (token, password) => {
        if (token === 'reset-token-123') {
            return { success: true };
        }
        throw new Error('Invalid token');
    }),
}));

// Mock email service
jest.mock('../../src/services/email', () => ({
    sendPasswordResetEmail: jest.fn(async (email, token) => {
        return { success: true };
    }),
}));

// Create test app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Require routes after mocks are set up
const authRoutes = require('../../src/routes/auth');
const oidcRoutes = require('../../src/routes/oidc');
app.use('/auth', authRoutes);
app.use('/.well-known', oidcRoutes);
app.use('/jwks.json', oidcRoutes);

describe('OIDC Endpoints', () => {
    describe('GET /.well-known/openid-configuration', () => {
        it('should return the OIDC configuration', async () => {
            const res = await request(app).get('/.well-known/openid-configuration');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('issuer');
            expect(res.body).toHaveProperty('authorization_endpoint');
            expect(res.body).toHaveProperty('token_endpoint');
            expect(res.body).toHaveProperty('userinfo_endpoint');
            expect(res.body).toHaveProperty('jwks_uri');
            expect(res.body).toHaveProperty('registration_endpoint');
            expect(res.body).toHaveProperty('response_types_supported');
            expect(res.body).toHaveProperty('subject_types_supported');
            expect(res.body).toHaveProperty('id_token_signing_alg_values_supported');
        });
    });

    describe('GET /jwks.json', () => {
        it('should return the JWKS document', async () => {
            const res = await request(app).get('/jwks.json');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('keys');
            expect(res.body.keys).toBeInstanceOf(Array);
            expect(res.body.keys.length).toBeGreaterThan(0);

            const key = res.body.keys[0];
            expect(key).toHaveProperty('kty');
            expect(key).toHaveProperty('kid');
            expect(key).toHaveProperty('use');
            expect(key).toHaveProperty('alg');
            expect(key.use).toEqual('sig');
        });
    });

    describe('Password Reset Flow', () => {
        it('should request a password reset', async () => {
            const res = await request(app)
                .post('/auth/reset-password')
                .send({
                    email: 'login@example.com',
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message');
        });

        it('should handle password reset with valid token', async () => {
            const res = await request(app)
                .post('/auth/reset-password/reset-token-123')
                .send({
                    password: 'newPassword123',
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message');
        });

        it('should reject password reset with invalid token', async () => {
            const res = await request(app)
                .post('/auth/reset-password/invalid-token')
                .send({
                    password: 'newPassword123',
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error');
        });
    });
});
