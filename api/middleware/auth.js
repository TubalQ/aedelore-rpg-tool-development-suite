const rateLimit = require('express-rate-limit');
const db = require('../db');

// Security: Account lockout settings
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const loginAttempts = new Map();

// Skip rate limiting in test environment
const skipInTest = () => process.env.NODE_ENV === 'test';

// Rate limiters
const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please slow down' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many authentication attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest
});

const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: { error: 'Too many password reset attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest
});

const errorLogLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: { error: 'Too many error reports' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest
});

// Auth cookie name (must match routes/auth.js)
const AUTH_COOKIE_NAME = 'auth_token';

// Authentication middleware
// Reads token from: 1) Authorization header, 2) Cookie, 3) Query param
async function authenticate(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '')
                || req.cookies?.[AUTH_COOKIE_NAME]
                || req.query.token;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const session = await db.get(
            "SELECT user_id, created_at FROM auth_tokens WHERE token = $1 AND created_at > NOW() - INTERVAL '24 hours'",
            [token]
        );

        if (!session) {
            await db.query('DELETE FROM auth_tokens WHERE token = $1', [token]);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        req.userId = session.user_id;
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(500).json({ error: 'Server error' });
    }
}

// Account lockout helpers
function isAccountLocked(username) {
    const attempts = loginAttempts.get(username);
    if (!attempts) return false;
    if (Date.now() - attempts.lastAttempt > LOCKOUT_DURATION) {
        loginAttempts.delete(username);
        return false;
    }
    return attempts.count >= MAX_LOGIN_ATTEMPTS;
}

function recordFailedAttempt(username) {
    const attempts = loginAttempts.get(username) || { count: 0, lastAttempt: 0 };
    attempts.count++;
    attempts.lastAttempt = Date.now();
    loginAttempts.set(username, attempts);
}

function clearLoginAttempts(username) {
    loginAttempts.delete(username);
}

module.exports = {
    generalLimiter,
    authLimiter,
    passwordResetLimiter,
    errorLogLimiter,
    authenticate,
    isAccountLocked,
    recordFailedAttempt,
    clearLoginAttempts
};
