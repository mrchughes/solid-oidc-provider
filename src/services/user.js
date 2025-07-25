// In-memory user storage - would be replaced with a database in production
const users = new Map();
const tokens = new Map();
const sessions = new Map();
const failedLogins = new Map();
const clientConsents = new Map();
const crypto = require('crypto');

// Create a new user
const createUser = (email, hashedPassword, webid) => {
    // Check if user already exists
    if (users.has(email)) {
        throw new Error('User already exists');
    }

    // Create user object
    const user = {
        id: generateUserId(),
        email,
        password: hashedPassword,
        webid: webid || generateWebId(email),
        createdAt: new Date().toISOString(),
        isLocked: false,
        lastLogin: null,
    };

    // Store user
    users.set(email, user);

    return user;
};

// Find user by email
const findUserByEmail = (email) => {
    return users.get(email) || null;
};

// Find user by ID
const findUserById = (id) => {
    for (const user of users.values()) {
        if (user.id === id) {
            return user;
        }
    }
    return null;
};

// Find user by WebID
const findUserByWebId = (webid) => {
    for (const user of users.values()) {
        if (user.webid === webid) {
            return user;
        }
    }
    return null;
};

// Store a password reset token
const storeResetToken = (email, token, expiresIn = 3600000) => {
    tokens.set(token, {
        email,
        expires: Date.now() + expiresIn
    });
    return {
        token,
        expires: new Date(Date.now() + expiresIn).toISOString()
    };
};

// Verify a password reset token
const verifyResetToken = (token) => {
    const tokenData = tokens.get(token);
    if (!tokenData) {
        return { valid: false, reason: 'Token not found' };
    }

    if (tokenData.expires < Date.now()) {
        tokens.delete(token);
        return { valid: false, reason: 'Token expired' };
    }

    return { valid: true, email: tokenData.email };
};

// Update user password
const updatePassword = (email, hashedPassword) => {
    const user = users.get(email);
    if (!user) {
        throw new Error('User not found');
    }

    // Update password
    user.password = hashedPassword;
    user.passwordChangedAt = new Date().toISOString();

    // Update user in map
    users.set(email, user);

    return user;
};

// Record failed login attempt
const recordFailedLogin = (email) => {
    // Get failed login attempts
    const attempts = failedLogins.get(email) || { count: 0, timestamp: null };

    // Update attempts
    attempts.count += 1;
    attempts.timestamp = Date.now();
    failedLogins.set(email, attempts);

    // Lock account if too many failures
    if (attempts.count >= 5) {
        const user = users.get(email);
        if (user) {
            user.isLocked = true;
            users.set(email, user);
        }
    }

    return attempts.count;
};

// Reset failed login attempts
const resetFailedLogins = (email) => {
    failedLogins.delete(email);
};

// Check if account is locked
const isAccountLocked = (email) => {
    const user = users.get(email);
    return user ? user.isLocked : false;
};

// Unlock account
const unlockAccount = (email) => {
    const user = users.get(email);
    if (!user) {
        throw new Error('User not found');
    }

    user.isLocked = false;
    users.set(email, user);
    resetFailedLogins(email);
};

// Record successful login
const recordSuccessfulLogin = (email) => {
    const user = users.get(email);
    if (!user) {
        throw new Error('User not found');
    }

    user.lastLogin = new Date().toISOString();
    users.set(email, user);
};

// Create user session
const createSession = (userId, sessionData) => {
    // Generate session ID
    const sessionId = crypto.randomUUID();

    // Create session
    const session = {
        id: sessionId,
        userId,
        data: {
            ...sessionData,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        }
    };

    // Store user sessions
    let userSessions = sessions.get(userId) || [];
    userSessions.push(session);
    sessions.set(userId, userSessions);

    return session;
};

// Get all user sessions
const getUserSessions = (userId) => {
    const userSessions = sessions.get(userId) || [];

    // Filter out expired sessions (older than 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const activeSessions = userSessions.filter(session => {
        const lastActivity = new Date(session.data.lastActivity).getTime();
        return lastActivity > thirtyDaysAgo;
    });

    return activeSessions;
};

// Remove session
const removeSession = (sessionId) => {
    for (const [userId, userSessions] of sessions.entries()) {
        const updatedSessions = userSessions.filter(session => session.id !== sessionId);
        sessions.set(userId, updatedSessions);
    }
};

// Store client consent
const storeClientConsent = (userId, clientId, scopes) => {
    // Get user's existing consents
    const userConsents = clientConsents.get(userId) || {};

    // Update or create consent for client
    userConsents[clientId] = {
        clientId,
        scopes,
        granted: new Date().toISOString()
    };

    // Save updated consents
    clientConsents.set(userId, userConsents);
};

// Check if user has consented to client with required scopes
const hasClientConsent = (userId, clientId, requiredScopes) => {
    // Get user's existing consents
    const userConsents = clientConsents.get(userId) || {};

    // Check if client has consent
    const clientConsent = userConsents[clientId];
    if (!clientConsent) {
        return false;
    }

    // Check if all required scopes are granted
    if (requiredScopes && requiredScopes.length > 0) {
        return requiredScopes.every(scope =>
            clientConsent.scopes.includes(scope)
        );
    }

    return true;
};

// Get all client consents for a user
const getUserConsents = (userId) => {
    const userConsents = clientConsents.get(userId) || {};

    // Convert object to array
    return Object.values(userConsents);
};

// Remove client consent
const removeClientConsent = (userId, clientId) => {
    const userConsents = clientConsents.get(userId) || {};
    delete userConsents[clientId];
    clientConsents.set(userId, userConsents);
};

// Generate a unique user ID
const generateUserId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Generate a WebID from email
const generateWebId = (email) => {
    const username = email.split('@')[0];
    return `https://user.example.org/profile/${username}#me`;
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    findUserByWebId,
    storeResetToken,
    verifyResetToken,
    updatePassword,
    recordFailedLogin,
    resetFailedLogins,
    isAccountLocked,
    unlockAccount,
    recordSuccessfulLogin,
    createSession,
    getUserSessions,
    removeSession,
    storeClientConsent,
    hasClientConsent,
    getUserConsents,
    removeClientConsent
};
