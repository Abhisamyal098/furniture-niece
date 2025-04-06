const rateLimit = require('express-rate-limit');

// Create rate limiter
const createLimiter = (options = {}) => {
    return rateLimit({
        windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
        max: options.max || 100, // limit each IP to 100 requests per windowMs
        message: options.message || 'Too many requests from this IP, please try again later',
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        ...options
    });
};

// Create login limiter
const loginLimiter = createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 login attempts per hour
    message: 'Too many login attempts from this IP, please try again after an hour'
});

// Create register limiter
const registerLimiter = createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 registration attempts per hour
    message: 'Too many registration attempts from this IP, please try again after an hour'
});

// Create password reset limiter
const passwordResetLimiter = createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset attempts per hour
    message: 'Too many password reset attempts from this IP, please try again after an hour'
});

// Create API limiter
const apiLimiter = createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many API requests from this IP, please try again later'
});

// Create admin API limiter
const adminApiLimiter = createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many admin API requests from this IP, please try again later'
});

// Create public API limiter
const publicApiLimiter = createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: 'Too many public API requests from this IP, please try again later'
});

module.exports = {
    createLimiter,
    loginLimiter,
    registerLimiter,
    passwordResetLimiter,
    apiLimiter,
    adminApiLimiter,
    publicApiLimiter
}; 