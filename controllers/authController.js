const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/jwt');
const { sendEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email');
const { sendSuccess, sendError, sendValidationError } = require('../utils/response');
const { validateEmail, validatePassword } = require('../utils/validator');
const { generateResetToken } = require('../utils/security');
const crypto = require('crypto');

// Create email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Register user
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Validate email
        if (!validateEmail(email)) {
            return sendValidationError(res, 'Please provide a valid email');
        }

        // Validate password
        if (!validatePassword(password)) {
            return sendValidationError(res, 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character');
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return sendError(res, 'User already exists', 400);
        }

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password
        });

        // Send welcome email
        await sendWelcomeEmail(user);

        // Generate token
        const token = generateToken(user._id);

        // Send response
        sendSuccess(res, {
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        }, 'User registered successfully', 201);
    } catch (error) {
        sendError(res, error.message);
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email
        if (!validateEmail(email)) {
            return sendValidationError(res, 'Please provide a valid email');
        }

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return sendError(res, 'Invalid credentials', 401);
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return sendError(res, 'Invalid credentials', 401);
        }

        // Generate token
        const token = generateToken(user._id);

        // Send response
        sendSuccess(res, {
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        sendError(res, error.message);
    }
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        sendSuccess(res, {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        sendError(res, error.message);
    }
};

// Update user details
exports.updateDetails = async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;

        // Validate email
        if (email && !validateEmail(email)) {
            return sendValidationError(res, 'Please provide a valid email');
        }

        // Check if email is taken
        if (email) {
            const userExists = await User.findOne({ email });
            if (userExists && userExists._id.toString() !== req.user.id) {
                return sendError(res, 'Email is already taken', 400);
            }
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                firstName,
                lastName,
                email
            },
            {
                new: true,
                runValidators: true
            }
        );

        sendSuccess(res, {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        sendError(res, error.message);
    }
};

// Update password
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate new password
        if (!validatePassword(newPassword)) {
            return sendValidationError(res, 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character');
        }

        // Get user
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return sendError(res, 'Current password is incorrect', 401);
        }

        // Update password
        user.password = newPassword;
        await user.save();

        sendSuccess(res, null, 'Password updated successfully');
    } catch (error) {
        sendError(res, error.message);
    }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!validateEmail(email)) {
            return sendValidationError(res, 'Please provide a valid email');
        }

        // Get user
        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, 'No user found with this email', 404);
        }

        // Generate reset token
        const { resetToken, resetPasswordToken, resetPasswordExpire } = generateResetToken();

        // Update user
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpire = resetPasswordExpire;
        await user.save();

        // Send email
        await sendPasswordResetEmail(user, resetToken);

        sendSuccess(res, null, 'Password reset email sent');
    } catch (error) {
        sendError(res, error.message);
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { resetToken, password } = req.body;

        // Validate password
        if (!validatePassword(password)) {
            return sendValidationError(res, 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character');
        }

        // Get reset password token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Get user
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return sendError(res, 'Invalid or expired reset token', 400);
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendSuccess(res, null, 'Password reset successful');
    } catch (error) {
        sendError(res, error.message);
    }
}; 