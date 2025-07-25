const userService = require('../services/user');
const emailService = require('../services/email');
const config = require('../config');
const twoFactorUtils = require('../utils/twoFactor');
const validationUtils = require('../utils/validation');

/**
 * User information endpoint for OIDC
 */
exports.userInfo = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Find user
        const user = await userService.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user info compliant with Solid OIDC
        return res.status(200).json({
            sub: user.id,
            iss: config.server.baseUrl,
            email: user.email,
            email_verified: user.emailVerified || false,
            webid: user.webid,
            name: user.name || undefined
        });
    } catch (error) {
        console.error('User info error:', error);
        return res.status(500).json({ error: 'Failed to get user information' });
    }
};

/**
 * Show user profile page
 */
exports.showProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const user = await userService.findUserById(userId);

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/login');
        }

        // Get count of authorized applications
        const authorizedClients = await userService.getAuthorizedClients(userId);

        // Get count of active sessions
        const sessions = await userService.getUserSessions(userId);

        res.render('profile', {
            title: 'Your Profile',
            user: {
                ...user,
                authorizedClients: authorizedClients,
                activeSessions: sessions.length
            },
            successMessage: req.query.success ? 'Your profile has been updated' : null
        });
    } catch (error) {
        console.error('Error showing profile:', error);
        req.flash('error', 'An error occurred while loading your profile');
        res.redirect('/');
    }
};

/**
 * Show form to edit display name
 */
exports.editNameForm = async (req, res) => {
    res.render('edit-name', {
        title: 'Edit Display Name',
        name: req.session.user.name || '',
        errors: null
    });
};

/**
 * Update user's display name
 */
exports.updateName = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.session.user.id;

        // Validate input
        const errors = {};

        if (!name || name.trim() === '') {
            errors.name = 'Enter your display name';
        }

        if (Object.keys(errors).length > 0) {
            return res.render('edit-name', {
                title: 'Edit Display Name',
                name,
                errors
            });
        }

        // Update name
        await userService.updateUser(userId, { name: name.trim() });

        // Update session
        req.session.user.name = name.trim();

        req.flash('success', 'Your display name has been updated');
        res.redirect('/profile?success=true');
    } catch (error) {
        console.error('Error updating name:', error);
        req.flash('error', 'An error occurred while updating your display name');
        res.redirect('/profile');
    }
};

/**
 * Show form to edit email
 */
exports.editEmailForm = async (req, res) => {
    try {
        res.render('edit-email', {
            title: 'Edit Email Address',
            email: req.session.user.email,
            errors: null
        });
    } catch (error) {
        console.error('Error showing email form:', error);
        req.flash('error', 'An error occurred');
        res.redirect('/profile');
    }
};

/**
 * Update user's email
 */
exports.updateEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const userId = req.session.user.id;

        // Validate input
        const errors = {};
        const emailError = validationUtils.validateEmail(email);
        if (emailError) {
            errors.email = emailError;
        }

        // Check if email is already in use
        const existingUser = await userService.findUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
            errors.email = 'Email address is already in use';
        }

        if (Object.keys(errors).length > 0) {
            return res.render('edit-email', {
                title: 'Edit Email Address',
                email,
                errors
            });
        }

        // Update email
        await userService.updateUser(userId, {
            email: email.trim(),
            emailVerified: false // Reset verification status
        });

        // Update session
        req.session.user.email = email.trim();

        // Send verification email in a real implementation

        req.flash('success', 'Your email address has been updated');
        res.redirect('/profile?success=true');
    } catch (error) {
        console.error('Error updating email:', error);
        req.flash('error', 'An error occurred while updating your email');
        res.redirect('/profile');
    }
};

/**
 * Show form to edit WebID
 */
exports.editWebIdForm = async (req, res) => {
    try {
        res.render('edit-webid', {
            title: 'Edit WebID',
            webid: req.session.user.webid || '',
            errors: null
        });
    } catch (error) {
        console.error('Error showing WebID form:', error);
        req.flash('error', 'An error occurred');
        res.redirect('/profile');
    }
};

/**
 * Update user's WebID
 */
exports.updateWebId = async (req, res) => {
    try {
        const { webid } = req.body;
        const userId = req.session.user.id;

        // Validate input
        const errors = {};

        if (webid && webid.trim() !== '') {
            const urlError = validationUtils.validateUrl(webid);
            if (urlError) {
                errors.webid = urlError;
            }
        }

        if (Object.keys(errors).length > 0) {
            return res.render('edit-webid', {
                title: 'Edit WebID',
                webid,
                errors
            });
        }

        // Update WebID
        await userService.updateUser(userId, { webid: webid.trim() });

        // Update session
        req.session.user.webid = webid.trim();

        req.flash('success', 'Your WebID has been updated');
        res.redirect('/profile?success=true');
    } catch (error) {
        console.error('Error updating WebID:', error);
        req.flash('error', 'An error occurred while updating your WebID');
        res.redirect('/profile');
    }
};

/**
 * Show form to change password
 */
exports.changePasswordForm = async (req, res) => {
    try {
        res.render('change-password', {
            title: 'Change Password',
            errors: null,
            success: false
        });
    } catch (error) {
        console.error('Error showing change password form:', error);
        req.flash('error', 'An error occurred');
        res.redirect('/profile');
    }
};

/**
 * Update user's password
 */
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, password, confirmPassword } = req.body;
        const userId = req.session.user.id;

        // Validate input
        const errors = {};

        if (!currentPassword || currentPassword.trim() === '') {
            errors.currentPassword = 'Enter your current password';
        }

        const passwordError = validationUtils.validatePassword(password, config.security.passwordPolicy);
        if (passwordError) {
            errors.password = passwordError;
        }

        const confirmError = validationUtils.validatePasswordsMatch(password, confirmPassword);
        if (confirmError) {
            errors.confirmPassword = confirmError;
        }

        // Verify current password
        const user = await userService.findUserById(userId);
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/login');
        }

        const isPasswordValid = await userService.verifyPassword(user, currentPassword);
        if (!isPasswordValid && !errors.currentPassword) {
            errors.currentPassword = 'Current password is incorrect';
        }

        if (Object.keys(errors).length > 0) {
            return res.render('change-password', {
                title: 'Change Password',
                errors,
                success: false
            });
        }

        // Update password
        await userService.updatePassword(userId, password);

        // Send password change notification email
        try {
            await emailService.sendPasswordChangedEmail(user.email);
        } catch (emailError) {
            console.error('Error sending password changed email:', emailError);
        }

        return res.render('change-password', {
            title: 'Change Password',
            errors: null,
            success: true
        });
    } catch (error) {
        console.error('Error updating password:', error);
        req.flash('error', 'An error occurred while updating your password');
        res.redirect('/profile');
    }
};

/**
 * Show two-factor authentication setup page
 */
exports.twoFactorSetupForm = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const user = await userService.findUserById(userId);

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/login');
        }

        // Check if 2FA is already enabled
        if (user.twoFactorEnabled) {
            req.flash('info', 'Two-factor authentication is already enabled');
            return res.redirect('/profile');
        }

        // Generate new secret for setup
        const secret = twoFactorUtils.generateSecret();

        // Generate QR code
        const qrCodeUrl = await twoFactorUtils.generateQRCode(user.email, secret);

        res.render('two-factor-setup', {
            title: '2-Factor Authentication Setup',
            secret,
            qrCodeUrl,
            errors: null
        });
    } catch (error) {
        console.error('Error showing 2FA setup:', error);
        req.flash('error', 'An error occurred while setting up two-factor authentication');
        res.redirect('/profile');
    }
};

/**
 * Verify and enable two-factor authentication
 */
exports.verifyAndEnableTwoFactor = async (req, res) => {
    try {
        const { code, secret } = req.body;
        const userId = req.session.user.id;

        // Validate input
        const errors = {};
        const codeError = validationUtils.validateVerificationCode(code);
        if (codeError) {
            errors.code = codeError;
        }

        if (!secret) {
            errors.code = 'Invalid setup, please try again';
        }

        if (Object.keys(errors).length > 0) {
            // Regenerate QR code for the same secret
            const user = await userService.findUserById(userId);
            const qrCodeUrl = await twoFactorUtils.generateQRCode(user.email, secret);

            return res.render('two-factor-setup', {
                title: '2-Factor Authentication Setup',
                secret,
                qrCodeUrl,
                errors
            });
        }

        // Verify the code
        const isValid = twoFactorUtils.verifyToken(code, secret);
        if (!isValid) {
            const user = await userService.findUserById(userId);
            const qrCodeUrl = await twoFactorUtils.generateQRCode(user.email, secret);

            return res.render('two-factor-setup', {
                title: '2-Factor Authentication Setup',
                secret,
                qrCodeUrl,
                errors: { code: 'Invalid verification code' }
            });
        }

        // Enable 2FA and save the secret
        await userService.updateUser(userId, {
            twoFactorEnabled: true,
            twoFactorSecret: secret
        });

        req.flash('success', 'Two-factor authentication has been enabled');
        res.redirect('/profile?success=true');
    } catch (error) {
        console.error('Error enabling 2FA:', error);
        req.flash('error', 'An error occurred while enabling two-factor authentication');
        res.redirect('/profile');
    }
};

/**
 * Disable two-factor authentication
 */
exports.disableTwoFactor = async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Disable 2FA
        await userService.updateUser(userId, {
            twoFactorEnabled: false,
            twoFactorSecret: null
        });

        req.flash('success', 'Two-factor authentication has been disabled');
        res.redirect('/profile?success=true');
    } catch (error) {
        console.error('Error disabling 2FA:', error);
        req.flash('error', 'An error occurred while disabling two-factor authentication');
        res.redirect('/profile');
    }
};

/**
 * List user's active sessions
 */
exports.listSessions = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const currentSessionId = req.session.id;

        // Get all active sessions for the user
        const sessions = await userService.getUserSessions(userId);

        // Mark the current session
        const formattedSessions = sessions.map(session => ({
            ...session,
            current: session.id === currentSessionId
        }));

        res.render('active-sessions', {
            title: 'Active Sessions',
            sessions: formattedSessions,
            successMessage: req.query.success ? 'Session terminated successfully' : null
        });
    } catch (error) {
        console.error('Error listing sessions:', error);
        req.flash('error', 'An error occurred while loading your sessions');
        res.redirect('/profile');
    }
};

/**
 * Revoke a specific session
 */
exports.revokeSession = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const sessionId = req.body.session_id;

        if (!sessionId) {
            req.flash('error', 'No session specified');
            return res.redirect('/profile/sessions');
        }

        // Prevent revoking the current session through this method
        if (sessionId === req.session.id) {
            req.flash('error', 'Cannot revoke your current session');
            return res.redirect('/profile/sessions');
        }

        // Revoke the session
        await userService.revokeSession(userId, sessionId);

        req.flash('success', 'Session has been terminated');
        res.redirect('/profile/sessions?success=true');
    } catch (error) {
        console.error('Error revoking session:', error);
        req.flash('error', 'An error occurred while terminating the session');
        res.redirect('/profile/sessions');
    }
};

/**
 * Revoke all sessions except the current one
 */
exports.revokeAllSessions = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const currentSessionId = req.session.id;

        // Revoke all other sessions
        await userService.revokeAllSessions(userId, currentSessionId);

        req.flash('success', 'All other sessions have been terminated');
        res.redirect('/profile/sessions?success=true');
    } catch (error) {
        console.error('Error revoking all sessions:', error);
        req.flash('error', 'An error occurred while terminating sessions');
        res.redirect('/profile/sessions');
    }
};

/**
 * Show authorized applications
 */
exports.showApplications = async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Get all authorized clients
        const authorizedClients = await userService.getAuthorizedClients(userId);

        res.render('manage-applications', {
            title: 'Manage Applications',
            authorizedClients,
            successMessage: req.query.success ? 'Application access revoked successfully' : null
        });
    } catch (error) {
        console.error('Error showing applications:', error);
        req.flash('error', 'An error occurred while loading your applications');
        res.redirect('/profile');
    }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { name } = req.body;

        // Get user
        const user = await userService.findUserById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user profile
        if (name !== undefined) {
            user.name = name;
        }

        // Return updated user info
        return res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                webid: user.webid
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ error: 'Failed to update user profile' });
    }
};