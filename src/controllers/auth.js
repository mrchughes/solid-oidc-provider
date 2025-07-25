/**
 * Show the session timeout warning page
 */
exports.showSessionTimeout = async (req, res) => {
    try {
        res.render('session-timeout', {
            title: 'Session Timeout Warning'
        });
    } catch (error) {
        console.error('Error showing session timeout page:', error);
        res.redirect('/');
    }
};

/**
 * Extend the current session
 */
exports.extendSession = async (req, res) => {
    try {
        // Update last active timestamp
        req.session.lastActive = Date.now();

        // Redirect back to the original page if available
        const returnTo = req.session.returnTo || '/profile';
        delete req.session.returnTo;

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error extending session:', error);
        res.status(500).json({ error: 'Failed to extend session' });
    }
};

/**
 * Show the session expired page
 */
exports.showSessionExpired = async (req, res) => {
    try {
        res.render('session-expired', {
            title: 'Session Expired'
        });
    } catch (error) {
        console.error('Error showing session expired page:', error);
        res.redirect('/login');
    }
};

/**
 * Show the account locked page
 */
exports.showAccountLocked = async (req, res) => {
    try {
        res.render('account-locked', {
            title: 'Account Locked',
            lockoutDuration: config.security.accountLockoutDuration / 60000 // Convert to minutes
        });
    } catch (error) {
        console.error('Error showing account locked page:', error);
        res.redirect('/login');
    }
};

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userService = require('../services/user');
const { validateEmail, validatePassword, validateRequired, validateVerificationCode } = require('../utils/validation');
const twoFactorUtils = require('../utils/twoFactor');
const emailService = require('../services/email');
const config = require('../config');

/**
 * Show login page
 */
exports.showLogin = async (req, res) => {
    try {
        // Check if there's a redirect URL in the query parameter
        const returnTo = req.query.returnTo || '/profile';

        // Store returnTo in session
        req.session.returnTo = returnTo;

        res.render('login', {
            title: 'Sign in',
            errors: req.flash('errors'),
            email: req.flash('email')[0] || '',
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error showing login page:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Something went wrong. Please try again later.'
        });
    }
};

/**
 * Process login form submission
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const errors = {};

        // Validate email
        const emailError = validateEmail(email);
        if (emailError) {
            errors.email = {
                text: emailError
            };
        }

        // Validate password
        const passwordError = validateRequired(password, 'your password');
        if (passwordError) {
            errors.password = {
                text: passwordError
            };
        }

        // If there are validation errors, redirect back to login page
        if (Object.keys(errors).length > 0) {
            req.flash('errors', errors);
            req.flash('email', email);
            return res.redirect('/login');
        }

        // Check if user exists
        const user = userService.findUserByEmail(email);
        if (!user) {
            // Don't reveal that the user doesn't exist for security reasons
            req.flash('errors', {
                form: {
                    text: 'Your email or password is incorrect'
                }
            });
            req.flash('email', email);
            return res.redirect('/login');
        }

        // Check if account is locked
        if (userService.isAccountLocked(email)) {
            return res.redirect('/account-locked');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            // Record failed login attempt
            userService.recordFailedLogin(email);

            // Check if account is now locked after this failed attempt
            if (userService.isAccountLocked(email)) {
                return res.redirect('/account-locked');
            }

            req.flash('errors', {
                form: {
                    text: 'Your email or password is incorrect'
                }
            });
            req.flash('email', email);
            return res.redirect('/login');
        }

        // Reset failed login attempts
        userService.resetFailedLogins(email);

        // If 2FA is enabled, redirect to 2FA page
        if (user.twoFactorEnabled) {
            req.session.twoFactorPending = {
                userId: user.id,
                email: user.email,
                expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
            };
            return res.redirect('/login/two-factor');
        }

        // Record successful login
        userService.recordSuccessfulLogin(email);

        // Set user in session
        req.session.user = {
            id: user.id,
            email: user.email,
            webid: user.webid
        };

        // Update last active timestamp
        req.session.lastActive = Date.now();

        // Check if there's a return URL in the session
        const returnTo = req.session.returnTo || '/profile';
        delete req.session.returnTo;

        // Send new sign-in email notification if enabled
        if (config.security && config.security.notifyOnNewSignIn) {
            try {
                await emailService.sendNewSignInEmail(user.email, {
                    date: new Date().toLocaleString(),
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent']
                });
            } catch (emailErr) {
                console.error('Failed to send sign-in notification email:', emailErr);
                // Don't block login if email fails
            }
        }

        res.redirect(returnTo);
    } catch (error) {
        console.error('Login error:', error);
        req.flash('errors', {
            form: {
                text: 'An error occurred. Please try again.'
            }
        });
        return res.redirect('/login');
    }
};

/**
 * Show two-factor authentication page
 */
exports.showTwoFactor = async (req, res) => {
    try {
        // Check if we have pending 2FA verification
        if (!req.session.twoFactorPending) {
            return res.redirect('/login');
        }

        // Check if the 2FA verification has expired
        if (req.session.twoFactorPending.expiresAt < Date.now()) {
            delete req.session.twoFactorPending;
            req.flash('errors', {
                form: {
                    text: 'Your verification session has expired. Please log in again.'
                }
            });
            return res.redirect('/login');
        }

        res.render('two-factor', {
            title: 'Two-factor authentication',
            email: req.session.twoFactorPending.email,
            errors: req.flash('errors'),
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error showing 2FA page:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Something went wrong. Please try again later.'
        });
    }
};

/**
 * Verify two-factor authentication code
 */
exports.verifyTwoFactor = async (req, res) => {
    try {
        const { code } = req.body;

        // Check if we have pending 2FA verification
        if (!req.session.twoFactorPending) {
            return res.redirect('/login');
        }

        // Check if the 2FA verification has expired
        if (req.session.twoFactorPending.expiresAt < Date.now()) {
            delete req.session.twoFactorPending;
            req.flash('errors', {
                form: {
                    text: 'Your verification session has expired. Please log in again.'
                }
            });
            return res.redirect('/login');
        }

        // Validate verification code
        const codeError = validateVerificationCode(code);
        if (codeError) {
            req.flash('errors', {
                code: {
                    text: codeError
                }
            });
            return res.redirect('/login/two-factor');
        }

        // Get user from pending 2FA
        const user = userService.findUserById(req.session.twoFactorPending.userId);
        if (!user) {
            delete req.session.twoFactorPending;
            req.flash('errors', {
                form: {
                    text: 'User not found. Please log in again.'
                }
            });
            return res.redirect('/login');
        }

        // Verify the code against the user's secret
        const isCodeValid = twoFactorUtils.verifyCode(code, user.twoFactorSecret);
        if (!isCodeValid) {
            req.flash('errors', {
                code: {
                    text: 'The verification code is invalid. Please try again.'
                }
            });
            return res.redirect('/login/two-factor');
        }

        // Record successful login
        userService.recordSuccessfulLogin(user.email);

        // Set user in session
        req.session.user = {
            id: user.id,
            email: user.email,
            webid: user.webid
        };

        // Update last active timestamp
        req.session.lastActive = Date.now();

        // Clean up 2FA pending data
        delete req.session.twoFactorPending;

        // Check if there's a return URL in the session
        const returnTo = req.session.returnTo || '/profile';
        delete req.session.returnTo;

        // Send new sign-in email notification if enabled
        if (config.security && config.security.notifyOnNewSignIn) {
            try {
                await emailService.sendNewSignInEmail(user.email, {
                    date: new Date().toLocaleString(),
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent']
                });
            } catch (emailErr) {
                console.error('Failed to send sign-in notification email:', emailErr);
                // Don't block login if email fails
            }
        }

        res.redirect(returnTo);
    } catch (error) {
        console.error('Error verifying 2FA:', error);
        req.flash('errors', {
            form: {
                text: 'An error occurred. Please try again.'
            }
        });
        return res.redirect('/login/two-factor');
    }
};

/**
 * Show registration page
 */
exports.showRegister = async (req, res) => {
    try {
        res.render('register', {
            title: 'Create an account',
            errors: req.flash('errors'),
            email: req.flash('email')[0] || '',
            webid: req.flash('webid')[0] || '',
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error showing registration page:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Something went wrong. Please try again later.'
        });
    }
};

/**
 * Process registration form submission
 */
exports.register = async (req, res) => {
    try {
        const { email, password, confirmPassword, webid } = req.body;
        const errors = {};

        // Validate email
        const emailError = validateEmail(email);
        if (emailError) {
            errors.email = {
                text: emailError
            };
        }

        // Check if user already exists
        if (!emailError && userService.findUserByEmail(email)) {
            errors.email = {
                text: 'An account with this email already exists'
            };
        }

        // Validate password
        const passwordPolicy = {
            minLength: 8,
            requireLowercase: true,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialChars: true
        };

        const passwordError = validatePassword(password, passwordPolicy);
        if (passwordError) {
            errors.password = {
                text: passwordError
            };
        }

        // Validate password confirmation
        if (!errors.password && password !== confirmPassword) {
            errors.confirmPassword = {
                text: 'Passwords do not match'
            };
        }

        // Validate WebID if provided
        if (webid && webid.trim() !== '') {
            try {
                new URL(webid);
            } catch (e) {
                errors.webid = {
                    text: 'Please enter a valid URL for your WebID'
                };
            }
        }

        // If there are validation errors, redirect back to registration page
        if (Object.keys(errors).length > 0) {
            req.flash('errors', errors);
            req.flash('email', email);
            req.flash('webid', webid);
            return res.redirect('/register');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = userService.createUser(email, hashedPassword, webid);

        // Set user in session
        req.session.user = {
            id: user.id,
            email: user.email,
            webid: user.webid
        };

        // Update last active timestamp
        req.session.lastActive = Date.now();

        // Send welcome email if email service is configured
        try {
            await emailService.sendWelcomeEmail(user.email, {
                name: email.split('@')[0] // Basic name extraction from email
            });
        } catch (emailErr) {
            console.error('Failed to send welcome email:', emailErr);
            // Don't block registration if email fails
        }

        // Redirect to profile page to complete setup
        res.redirect('/profile');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('errors', {
            form: {
                text: 'An error occurred during registration. Please try again.'
            }
        });
        return res.redirect('/register');
    }
};

/**
 * Show forgot password page
 */
exports.showForgotPassword = async (req, res) => {
    try {
        res.render('forgot-password', {
            title: 'Reset your password',
            errors: req.flash('errors'),
            email: req.flash('email')[0] || '',
            success: req.flash('success')[0] || false,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error showing forgot password page:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Something went wrong. Please try again later.'
        });
    }
};

/**
 * Process forgot password form submission
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        const emailError = validateEmail(email);
        if (emailError) {
            req.flash('errors', {
                email: {
                    text: emailError
                }
            });
            req.flash('email', email);
            return res.redirect('/forgot-password');
        }

        // Check if user exists (but don't reveal to the user for security)
        const user = userService.findUserByEmail(email);

        // Generate a token even if user doesn't exist to prevent timing attacks
        const token = crypto.randomBytes(32).toString('hex');

        // If user exists, store the token
        if (user) {
            // Store token with expiration (1 hour)
            userService.storeResetToken(email, token, 3600000);

            // Generate reset link
            const resetLink = `${config.issuer}/reset-password?token=${token}`;

            // Send reset email
            await emailService.sendPasswordResetEmail(email, {
                resetLink,
                expiresIn: '1 hour'
            });
        }

        // Always show success message even if user doesn't exist (security)
        req.flash('success', true);
        return res.redirect('/forgot-password');
    } catch (error) {
        console.error('Forgot password error:', error);
        req.flash('errors', {
            form: {
                text: 'An error occurred. Please try again.'
            }
        });
        return res.redirect('/forgot-password');
    }
};

/**
 * Show reset password page
 */
exports.showResetPassword = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.redirect('/forgot-password');
        }

        // Verify token (don't reveal if it's invalid for security)
        const email = userService.verifyResetToken(token);

        if (!email) {
            return res.render('reset-password-expired', {
                title: 'Reset link expired'
            });
        }

        res.render('reset-password', {
            title: 'Set new password',
            token,
            errors: req.flash('errors'),
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error showing reset password page:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Something went wrong. Please try again later.'
        });
    }
};

/**
 * Process reset password form submission
 */
exports.resetPassword = async (req, res) => {
    try {
        const { token, password, confirmPassword } = req.body;

        // Verify token
        const email = userService.verifyResetToken(token);

        if (!email) {
            return res.render('reset-password-expired', {
                title: 'Reset link expired'
            });
        }

        const errors = {};

        // Validate password
        const passwordPolicy = {
            minLength: 8,
            requireLowercase: true,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialChars: true
        };

        const passwordError = validatePassword(password, passwordPolicy);
        if (passwordError) {
            errors.password = {
                text: passwordError
            };
        }

        // Validate password confirmation
        if (!errors.password && password !== confirmPassword) {
            errors.confirmPassword = {
                text: 'Passwords do not match'
            };
        }

        // If there are validation errors, redirect back to reset password page
        if (Object.keys(errors).length > 0) {
            req.flash('errors', errors);
            return res.redirect(`/reset-password?token=${token}`);
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user password
        userService.updatePassword(email, hashedPassword);

        // Clear the reset token
        userService.verifyResetToken(token); // This removes the token

        // Send password changed confirmation email
        try {
            await emailService.sendPasswordChangedEmail(email, {
                date: new Date().toLocaleString(),
                ipAddress: req.ip
            });
        } catch (emailErr) {
            console.error('Failed to send password changed email:', emailErr);
            // Continue even if email fails
        }

        // Redirect to password reset success page
        res.render('reset-password-success', {
            title: 'Password reset successful'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        req.flash('errors', {
            form: {
                text: 'An error occurred. Please try again.'
            }
        });
        return res.redirect(`/reset-password?token=${req.body.token}`);
    }
};

/**
 * Log user out
 */
exports.logout = async (req, res) => {
    try {
        // Clear user session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }

            // Redirect to login page
            res.redirect('/login');
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.redirect('/login');
    }
};

/**
 * Show consent page for OIDC authorization
 */
exports.showConsent = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.session.user) {
            // Store consent request in session
            req.session.consentRequest = {
                clientId: req.query.client_id,
                scope: req.query.scope,
                redirectUri: req.query.redirect_uri,
                state: req.query.state,
                nonce: req.query.nonce,
                responseType: req.query.response_type
            };

            // Store original URL to redirect back after login
            req.session.returnTo = req.originalUrl;

            return res.redirect('/login');
        }

        // Get client details from OIDC provider
        const clientId = req.query.client_id;
        const requestedScopes = req.query.scope ? req.query.scope.split(' ') : [];

        // Check if client is already authorized for all requested scopes
        if (userService.hasClientConsent(req.session.user.id, clientId, requestedScopes)) {
            // Automatically approve if user has already consented
            return res.redirect(`/consent/approve?client_id=${clientId}`);
        }

        // Prepare scope descriptions for display
        const scopeDescriptions = {
            'openid': 'Verify your identity',
            'profile': 'Access your basic profile information',
            'email': 'Access your email address',
            'webid': 'Access your WebID (unique identifier)',
            'offline_access': 'Access your data when you are not logged in'
        };

        // Format scopes for display
        const scopes = requestedScopes.map(scope => ({
            id: scope,
            description: scopeDescriptions[scope] || `Access to ${scope}`
        }));

        // Render consent page
        res.render('consent', {
            title: 'Authorize application',
            clientId,
            clientName: req.query.client_name || clientId,
            scopes,
            redirectUri: req.query.redirect_uri,
            state: req.query.state,
            nonce: req.query.nonce,
            responseType: req.query.response_type,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error showing consent page:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Something went wrong. Please try again later.'
        });
    }
};

/**
 * Process consent approval
 */
exports.approveConsent = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const { client_id, redirect_uri, state, nonce, response_type } = req.body;
        const scope = req.body.scope || '';

        // Store user consent
        userService.storeClientConsent(req.session.user.id, client_id, scope.split(' '));

        // Build redirect URL with authorization code or tokens
        let redirectUrl = redirect_uri;

        // Add query parameters
        if (redirect_uri.includes('?')) {
            redirectUrl += '&';
        } else {
            redirectUrl += '?';
        }

        // Add code or tokens based on response_type
        if (response_type === 'code') {
            // Generate authorization code
            const code = crypto.randomBytes(16).toString('hex');

            // Store code for later exchange
            // This would be handled by the OIDC library in production

            redirectUrl += `code=${code}`;
        } else if (response_type.includes('token')) {
            // Generate access token
            // This would be handled by the OIDC library in production
            const accessToken = 'sample_access_token';

            redirectUrl += `access_token=${accessToken}&token_type=Bearer`;
        }

        // Add state if provided
        if (state) {
            redirectUrl += `&state=${state}`;
        }

        // Send new app authorization email notification if enabled
        if (config.security && config.security.notifyOnNewAppAuthorization) {
            try {
                const user = userService.findUserById(req.session.user.id);
                await emailService.sendAppAuthorizedEmail(user.email, {
                    appName: client_id,
                    date: new Date().toLocaleString(),
                    scopes: scope.split(' ').join(', '),
                    ipAddress: req.ip
                });
            } catch (emailErr) {
                console.error('Failed to send app authorization email:', emailErr);
                // Don't block consent if email fails
            }
        }

        // Redirect to client
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Error processing consent:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Something went wrong. Please try again later.'
        });
    }
};

/**
 * Process consent denial
 */
exports.denyConsent = async (req, res) => {
    try {
        const { redirect_uri, state } = req.body;

        // Build redirect URL with error
        let redirectUrl = redirect_uri;

        // Add query parameters
        if (redirect_uri.includes('?')) {
            redirectUrl += '&';
        } else {
            redirectUrl += '?';
        }

        // Add error parameter
        redirectUrl += 'error=access_denied&error_description=The+user+denied+the+request';

        // Add state if provided
        if (state) {
            redirectUrl += `&state=${state}`;
        }

        // Redirect to client
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Error denying consent:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Something went wrong. Please try again later.'
        });
    }
};

// Register a new user
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters long'
            });
        }

        // Check if user already exists
        const existingUser = userService.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = userService.createUser(email, hashedPassword);

        // Return success
        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                webid: user.webid,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Failed to register user' });
    }
};// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = userService.findUserByEmail(email);
        if (!user) {
            // Record failed login attempt for non-existent user to prevent user enumeration
            userService.recordFailedLogin(email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if account is locked
        if (userService.isAccountLocked(email)) {
            return res.status(401).json({
                error: 'Account is locked due to too many failed attempts. Please reset your password or try again later.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            // Record failed login attempt
            const failedAttempts = userService.recordFailedLogin(email);

            if (failedAttempts >= 5) {
                return res.status(401).json({
                    error: 'Account is locked due to too many failed attempts. Please reset your password or try again later.'
                });
            }

            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Record successful login
        userService.recordSuccessfulLogin(email);

        // Create session
        const session = userService.createSession(user.id, {
            lastActivity: new Date().toISOString()
        });

        // Generate access token
        const token = jwtUtils.generateToken({
            id: user.id,
            email: user.email,
            webid: user.webid,
            sessionId: session.id
        });

        // Return success
        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                webid: user.webid,
            },
            token,
            expiresIn: 3600 // 1 hour
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Failed to authenticate user' });
    }
};

// Request password reset
exports.requestReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find user
        const user = userService.findUserByEmail(email);
        if (!user) {
            // Don't reveal that the user doesn't exist for security
            return res.status(200).json({ message: 'If your email is registered, you will receive a reset link' });
        }

        // Generate token
        const token = uuidv4();
        userService.storeResetToken(email, token);

        // Send email
        await emailService.sendPasswordReset(email, token);

        // Return success
        return res.status(200).json({ message: 'If your email is registered, you will receive a reset link' });
    } catch (error) {
        console.error('Password reset request error:', error);
        return res.status(500).json({ error: 'Failed to process reset request' });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Validate input
        if (!token || !password) {
            return res.status(400).json({ error: 'Token and password are required' });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters long'
            });
        }

        // Verify token
        const email = userService.verifyResetToken(token);
        if (!email) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password
        userService.updatePassword(email, hashedPassword);

        // Unlock account if it was locked
        userService.unlockAccount(email);

        // Return success
        return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Password reset error:', error);
        return res.status(500).json({ error: 'Failed to reset password' });
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (sessionId) {
            userService.removeSession(sessionId);
        }

        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ error: 'Failed to logout user' });
    }
};

// Get user sessions
exports.getSessions = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const sessions = userService.getUserSessions(userId);

        // Don't expose sensitive session data
        const sanitizedSessions = sessions.map(session => ({
            id: session.id,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt
        }));

        return res.status(200).json(sanitizedSessions);
    } catch (error) {
        console.error('Get sessions error:', error);
        return res.status(500).json({ error: 'Failed to get user sessions' });
    }
};

// Revoke session
exports.revokeSession = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { sessionId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const sessions = userService.getUserSessions(userId);
        const session = sessions.find(s => s.id === sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        userService.removeSession(sessionId);

        return res.status(200).json({ message: 'Session revoked successfully' });
    } catch (error) {
        console.error('Revoke session error:', error);
        return res.status(500).json({ error: 'Failed to revoke session' });
    }
};
