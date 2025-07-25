const twoFactorUtils = require('../../src/utils/twoFactor');
const crypto = require('crypto');

// Mock crypto module
jest.mock('crypto', () => ({
    randomBytes: jest.fn().mockReturnValue({
        toString: jest.fn().mockReturnValue('123456789012345678901234')
    }),
    createHmac: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue({
            readInt32BE: jest.fn().mockReturnValue(123456)
        })
    })
}));

describe('Two Factor Utils', () => {
    describe('generateSecret', () => {
        it('should generate a valid TOTP secret', () => {
            const secret = twoFactorUtils.generateSecret();

            expect(secret).toBeDefined();
            expect(typeof secret).toBe('string');
            expect(secret.length).toBeGreaterThan(0);
        });
    });

    describe('generateTOTP', () => {
        it('should generate a valid TOTP code', () => {
            const secret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const code = twoFactorUtils.generateTOTP(secret);

            expect(code).toBeDefined();
            expect(typeof code).toBe('string');
            expect(code.length).toBe(6);
            expect(code).toMatch(/^\d{6}$/); // 6-digit number
        });

        it('should generate different codes for different secrets', () => {
            // Reset the mock to ensure distinct values
            crypto.createHmac.mockImplementationOnce(() => ({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue({
                    readInt32BE: jest.fn().mockReturnValue(123456)
                })
            }));

            crypto.createHmac.mockImplementationOnce(() => ({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue({
                    readInt32BE: jest.fn().mockReturnValue(654321)
                })
            }));

            const secret1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const secret2 = 'ZYXWVUTSRQPONMLKJIHGFEDCBA';

            const code1 = twoFactorUtils.generateTOTP(secret1);
            const code2 = twoFactorUtils.generateTOTP(secret2);

            expect(code1).not.toBe(code2);
        });
    });

    describe('verifyTOTP', () => {
        it('should verify a valid TOTP code', () => {
            const secret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const code = '123456'; // Mock code that matches our mocked crypto

            const isValid = twoFactorUtils.verifyTOTP(secret, code);

            expect(isValid).toBe(true);
        });

        it('should reject an invalid TOTP code', () => {
            const secret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const code = '999999'; // Different from our mock

            const isValid = twoFactorUtils.verifyTOTP(secret, code);

            expect(isValid).toBe(false);
        });

        it('should reject a code with invalid format', () => {
            const secret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const invalidCodes = ['12345', '1234567', 'abcdef', '12345a'];

            invalidCodes.forEach(code => {
                const isValid = twoFactorUtils.verifyTOTP(secret, code);
                expect(isValid).toBe(false);
            });
        });
    });

    describe('generateQRCodeURL', () => {
        it('should generate a valid QR code URL', () => {
            const secret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const email = 'test@example.com';
            const issuer = 'Solid OIDC Provider';

            const url = twoFactorUtils.generateQRCodeURL(secret, email, issuer);

            expect(url).toBeDefined();
            expect(typeof url).toBe('string');
            expect(url).toContain('otpauth://totp/');
            expect(url).toContain(encodeURIComponent(email));
            expect(url).toContain(encodeURIComponent(issuer));
            expect(url).toContain(encodeURIComponent(secret));
        });

        it('should handle special characters in email and issuer', () => {
            const secret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const email = 'test+special@example.com';
            const issuer = 'Solid OIDC Provider (Test)';

            const url = twoFactorUtils.generateQRCodeURL(secret, email, issuer);

            expect(url).toBeDefined();
            expect(url).toContain(encodeURIComponent(email));
            expect(url).toContain(encodeURIComponent(issuer));
        });
    });
});
