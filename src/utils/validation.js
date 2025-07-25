/**
 * Form validation utilities following GOV.UK Design System patterns
 */

/**
 * Validate an email address
 * @param {string} email - Email address to validate
 * @returns {string|null} Error message or null if valid
 */
function validateEmail(email) {
    if (!email || email.trim() === '') {
        return 'Enter an email address';
    }

    // Simple email regex - GOV.UK recommends not using complex regex for accessibility reasons
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Enter an email address in the correct format, like name@example.com';
    }

    return null;
}

/**
 * Validate a password against the password policy
 * @param {string} password - Password to validate
 * @param {object} policy - Password policy configuration
 * @returns {string|null} Error message or null if valid
 */
function validatePassword(password, policy = {}) {
    const {
        minLength = 8,
        requireLowercase = true,
        requireUppercase = true,
        requireNumbers = true,
        requireSpecialChars = true
    } = policy;

    if (!password || password.trim() === '') {
        return 'Enter a password';
    }

    if (password.length < minLength) {
        return `Password must be at least ${minLength} characters`;
    }

    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[^A-Za-z0-9]/.test(password);

    const missingRequirements = [];

    if (requireLowercase && !hasLowercase) missingRequirements.push('lowercase letter');
    if (requireUppercase && !hasUppercase) missingRequirements.push('uppercase letter');
    if (requireNumbers && !hasNumbers) missingRequirements.push('number');
    if (requireSpecialChars && !hasSpecialChars) missingRequirements.push('special character');

    if (missingRequirements.length > 0) {
        return `Password must include at least one ${missingRequirements.join(', ')}`;
    }

    return null;
}

/**
 * Validate that passwords match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {string|null} Error message or null if valid
 */
function validatePasswordsMatch(password, confirmPassword) {
    if (!confirmPassword || confirmPassword.trim() === '') {
        return 'Confirm your password';
    }

    if (password !== confirmPassword) {
        return 'Passwords do not match';
    }

    return null;
}

/**
 * Validate a required field
 * @param {string} value - Field value
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 */
function validateRequired(value, fieldName) {
    if (!value || value.trim() === '') {
        return `Enter ${fieldName.toLowerCase()}`;
    }

    return null;
}

/**
 * Validate a URL
 * @param {string} url - URL to validate
 * @returns {string|null} Error message or null if valid
 */
function validateUrl(url) {
    if (!url || url.trim() === '') {
        return null; // URL is optional
    }

    try {
        new URL(url);
        return null;
    } catch (e) {
        return 'Enter a URL in the correct format, like https://example.com';
    }
}

/**
 * Validate a 6-digit verification code
 * @param {string} code - Verification code to validate
 * @returns {string|null} Error message or null if valid
 */
function validateVerificationCode(code) {
    if (!code || code.trim() === '') {
        return 'Enter the verification code';
    }

    if (!/^\d{6}$/.test(code)) {
        return 'Enter a 6-digit code';
    }

    return null;
}

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
    if (!input) return '';

    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

module.exports = {
    validateEmail,
    validatePassword,
    validatePasswordsMatch,
    validateRequired,
    validateUrl,
    validateVerificationCode,
    sanitizeInput
};
