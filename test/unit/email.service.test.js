const emailService = require('../../src/services/email');

// Mock nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockImplementation((mailOptions) => {
            return Promise.resolve({
                messageId: 'mock-message-id',
                envelope: {
                    from: mailOptions.from,
                    to: [mailOptions.to],
                },
                accepted: [mailOptions.to],
                rejected: [],
            });
        }),
    }),
}));

describe('Email Service', () => {
    describe('sendPasswordResetEmail', () => {
        it('should send a password reset email', async () => {
            const email = 'test@example.com';
            const token = 'reset-token-123';

            const result = await emailService.sendPasswordResetEmail(email, token);

            expect(result).toBeDefined();
            expect(result.messageId).toBe('mock-message-id');
            expect(result.envelope.to).toContain(email);
            expect(result.accepted).toContain(email);
            expect(result.rejected).toHaveLength(0);
        });

        it('should handle errors', async () => {
            // Mock a transporter error
            const nodemailer = require('nodemailer');
            nodemailer.createTransport.mockReturnValueOnce({
                sendMail: jest.fn().mockRejectedValue(new Error('Failed to send email')),
            });

            await expect(
                emailService.sendPasswordResetEmail('test@example.com', 'token')
            ).rejects.toThrow('Failed to send email');
        });
    });

    describe('sendVerificationEmail', () => {
        it('should send a verification email', async () => {
            const email = 'test@example.com';
            const token = 'verify-token-123';

            const result = await emailService.sendVerificationEmail(email, token);

            expect(result).toBeDefined();
            expect(result.messageId).toBe('mock-message-id');
            expect(result.envelope.to).toContain(email);
            expect(result.accepted).toContain(email);
            expect(result.rejected).toHaveLength(0);
        });
    });

    describe('sendTwoFactorEmail', () => {
        it('should send a two-factor authentication email', async () => {
            const email = 'test@example.com';
            const code = '123456';

            const result = await emailService.sendTwoFactorEmail(email, code);

            expect(result).toBeDefined();
            expect(result.messageId).toBe('mock-message-id');
            expect(result.envelope.to).toContain(email);
            expect(result.accepted).toContain(email);
            expect(result.rejected).toHaveLength(0);
        });
    });

    describe('sendAppAuthorizedEmail', () => {
        it('should send an app authorization notification email', async () => {
            const email = 'test@example.com';
            const appName = 'Test App';
            const scopes = ['openid', 'profile', 'email'];

            const result = await emailService.sendAppAuthorizedEmail(email, appName, scopes);

            expect(result).toBeDefined();
            expect(result.messageId).toBe('mock-message-id');
            expect(result.envelope.to).toContain(email);
            expect(result.accepted).toContain(email);
            expect(result.rejected).toHaveLength(0);
        });
    });

    describe('sendPasswordChangedEmail', () => {
        it('should send a password changed notification email', async () => {
            const email = 'test@example.com';

            const result = await emailService.sendPasswordChangedEmail(email);

            expect(result).toBeDefined();
            expect(result.messageId).toBe('mock-message-id');
            expect(result.envelope.to).toContain(email);
            expect(result.accepted).toContain(email);
            expect(result.rejected).toHaveLength(0);
        });
    });
});
