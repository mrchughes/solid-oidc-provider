const validationUtils = require('../../src/utils/validation');

describe('Validation Utils', () => {
    describe('validateEmail', () => {
        it('should validate a correct email format', () => {
            const validEmails = [
                'test@example.com',
                'user.name@example.co.uk',
                'user+tag@example.org',
                'a@b.c'
            ];

            validEmails.forEach(email => {
                const result = validationUtils.validateEmail(email);
                expect(result).toBe(true);
            });
        });

        it('should reject invalid email formats', () => {
            const invalidEmails = [
                'test',
                'test@',
                '@example.com',
                'test@example',
                'test@@example.com',
                'test@example..com',
                'test@.com',
                ' test@example.com',
                'test@example.com '
            ];

            invalidEmails.forEach(email => {
                const result = validationUtils.validateEmail(email);
                expect(result).toBe(false);
            });
        });

        it('should handle edge cases', () => {
            expect(validationUtils.validateEmail('')).toBe(false);
            expect(validationUtils.validateEmail(null)).toBe(false);
            expect(validationUtils.validateEmail(undefined)).toBe(false);
            expect(validationUtils.validateEmail(123)).toBe(false);
        });
    });

    describe('validatePassword', () => {
        it('should validate a strong password', () => {
            const validPasswords = [
                'Password123!',
                'ComplexP@ssw0rd',
                'P@ssw0rd123',
                'L0ngP@ssword!WithMoreChar@cters'
            ];

            validPasswords.forEach(password => {
                const result = validationUtils.validatePassword(password);
                expect(result).toBe(true);
            });
        });

        it('should reject weak passwords', () => {
            const invalidPasswords = [
                'password',
                'Password',
                'password123',
                '12345678',
                'short',
                'ALLUPPERCASE',
                'alllowercase',
                '1234567890'
            ];

            invalidPasswords.forEach(password => {
                const result = validationUtils.validatePassword(password);
                expect(result).toBe(false);
            });
        });

        it('should enforce minimum length', () => {
            expect(validationUtils.validatePassword('P@ss1')).toBe(false); // Too short
            expect(validationUtils.validatePassword('P@ssw0rd')).toBe(true); // Meets minimum length
        });

        it('should handle edge cases', () => {
            expect(validationUtils.validatePassword('')).toBe(false);
            expect(validationUtils.validatePassword(null)).toBe(false);
            expect(validationUtils.validatePassword(undefined)).toBe(false);
            expect(validationUtils.validatePassword(123456)).toBe(false);
        });
    });

    describe('validateWebId', () => {
        it('should validate a correct WebID format', () => {
            const validWebIds = [
                'https://example.org/profile/card#me',
                'https://user.example.com/profile#i',
                'http://localhost:8080/alice/card#me'
            ];

            validWebIds.forEach(webid => {
                const result = validationUtils.validateWebId(webid);
                expect(result).toBe(true);
            });
        });

        it('should reject invalid WebID formats', () => {
            const invalidWebIds = [
                'example.org/profile/card#me', // Missing protocol
                'https://example.org/profile/card', // Missing fragment
                'ftp://example.org/profile/card#me', // Wrong protocol
                'https:/example.org/profile/card#me', // Malformed URL
                'https://example.org/profile/card#', // Empty fragment
                'https://user@example.com/profile#i' // Authentication not allowed
            ];

            invalidWebIds.forEach(webid => {
                const result = validationUtils.validateWebId(webid);
                expect(result).toBe(false);
            });
        });

        it('should handle edge cases', () => {
            expect(validationUtils.validateWebId('')).toBe(false);
            expect(validationUtils.validateWebId(null)).toBe(false);
            expect(validationUtils.validateWebId(undefined)).toBe(false);
            expect(validationUtils.validateWebId(123)).toBe(false);
        });
    });

    describe('sanitizeInput', () => {
        it('should remove potentially dangerous characters', () => {
            const inputs = [
                '<script>alert("XSS")</script>',
                'Normal text with <img src="x" onerror="alert(1)">',
                'Text with HTML entities &lt;script&gt;',
                'Multi\nline\r\ntext',
                '   Text with spaces   '
            ];

            const expected = [
                'alert("XSS")',
                'Normal text with ',
                'Text with HTML entities &lt;script&gt;',
                'Multi\nline\r\ntext',
                '   Text with spaces   '
            ];

            inputs.forEach((input, index) => {
                const result = validationUtils.sanitizeInput(input);
                expect(result).toBe(expected[index]);
            });
        });

        it('should handle different input types', () => {
            expect(validationUtils.sanitizeInput('')).toBe('');
            expect(validationUtils.sanitizeInput(null)).toBe('');
            expect(validationUtils.sanitizeInput(undefined)).toBe('');
            expect(validationUtils.sanitizeInput(123)).toBe('123');
            expect(validationUtils.sanitizeInput(true)).toBe('true');
        });
    });
});
