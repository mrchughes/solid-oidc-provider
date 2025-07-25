const request = require('supertest');
const express = require('express');

// Create a test app with only the profile routes
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock the user service
jest.mock('../../src/services/user', () => ({
    getUserById: jest.fn((id) => {
        if (id === 'test-id') {
            return {
                id: 'test-id',
                email: 'test@example.com',
                webid: 'https://example.com/profile/test@example.com#me',
                name: 'Test User',
                sessions: [
                    {
                        id: 'session-1',
                        device: 'Chrome on Windows',
                        lastAccess: new Date(),
                        isCurrentSession: true
                    },
                    {
                        id: 'session-2',
                        device: 'Firefox on Mac',
                        lastAccess: new Date(Date.now() - 86400000), // 1 day ago
                        isCurrentSession: false
                    }
                ],
                authorizedApps: [
                    {
                        id: 'app-1',
                        name: 'Test App',
                        clientId: 'client-1',
                        scopes: ['openid', 'profile', 'email'],
                        lastAccess: new Date()
                    }
                ]
            };
        }
        return null;
    }),
    updateUserProfile: jest.fn(async (id, data) => {
        if (id === 'test-id') {
            return {
                id: 'test-id',
                email: data.email || 'test@example.com',
                name: data.name || 'Test User',
                webid: 'https://example.com/profile/test@example.com#me'
            };
        }
        throw new Error('User not found');
    }),
    revokeUserSession: jest.fn(async (userId, sessionId) => {
        if (userId === 'test-id' && (sessionId === 'session-1' || sessionId === 'session-2')) {
            return { success: true };
        }
        throw new Error('Session not found');
    }),
    revokeClientAuthorization: jest.fn(async (userId, clientId) => {
        if (userId === 'test-id' && clientId === 'client-1') {
            return { success: true };
        }
        throw new Error('Client authorization not found');
    })
}));

// Mock auth middleware
jest.mock('../../src/middleware/auth', () => ({
    isAuthenticated: (req, res, next) => {
        req.user = {
            id: 'test-id',
            email: 'test@example.com',
            webid: 'https://example.com/profile/test@example.com#me'
        };
        req.isAuthenticated = () => true;
        next();
    }
}));

// Mock flash middleware
jest.mock('../../src/middleware/flash', () => ({
    flash: (req, res, next) => {
        req.flash = jest.fn();
        res.locals.flash = {};
        next();
    }
}));

// Now require routes after mocks are set up
const profileRoutes = require('../../src/routes/profile');
app.use('/profile', profileRoutes);

describe('Profile API', () => {
    describe('GET /profile', () => {
        it('should show the user profile', async () => {
            const res = await request(app).get('/profile');
            expect(res.statusCode).toEqual(200);
            // In a real test, we would check HTML content
        });
    });

    describe('POST /profile/update', () => {
        it('should update the user profile', async () => {
            const res = await request(app)
                .post('/profile/update')
                .send({
                    name: 'Updated Name',
                    email: 'updated@example.com'
                });

            expect(res.statusCode).toEqual(302); // Redirect after update
        });

        it('should handle update errors', async () => {
            // Mock the error case
            const userService = require('../../src/services/user');
            userService.updateUserProfile.mockRejectedValueOnce(new Error('Update failed'));

            const res = await request(app)
                .post('/profile/update')
                .send({
                    name: 'Will Fail',
                    email: 'fail@example.com'
                });

            expect(res.statusCode).toEqual(302); // Redirect after error
        });
    });

    describe('GET /profile/sessions', () => {
        it('should show user sessions', async () => {
            const res = await request(app).get('/profile/sessions');
            expect(res.statusCode).toEqual(200);
        });
    });

    describe('POST /profile/sessions/revoke', () => {
        it('should revoke a user session', async () => {
            const res = await request(app)
                .post('/profile/sessions/revoke')
                .send({
                    sessionId: 'session-2'
                });

            expect(res.statusCode).toEqual(302); // Redirect after revoke
        });

        it('should handle revoke errors', async () => {
            const res = await request(app)
                .post('/profile/sessions/revoke')
                .send({
                    sessionId: 'non-existent-session'
                });

            expect(res.statusCode).toEqual(302); // Redirect after error
        });
    });

    describe('GET /profile/applications', () => {
        it('should show authorized applications', async () => {
            const res = await request(app).get('/profile/applications');
            expect(res.statusCode).toEqual(200);
        });
    });

    describe('POST /profile/applications/revoke', () => {
        it('should revoke an application authorization', async () => {
            const res = await request(app)
                .post('/profile/applications/revoke')
                .send({
                    clientId: 'client-1'
                });

            expect(res.statusCode).toEqual(302); // Redirect after revoke
        });

        it('should handle revoke errors', async () => {
            const res = await request(app)
                .post('/profile/applications/revoke')
                .send({
                    clientId: 'non-existent-client'
                });

            expect(res.statusCode).toEqual(302); // Redirect after error
        });
    });
});
