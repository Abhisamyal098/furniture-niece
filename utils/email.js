const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Send email
const sendEmail = async (options) => {
    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    const info = await transporter.sendMail(message);
    return info;
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
    const subject = 'Welcome to FurniCraft';
    const message = `Hi ${user.firstName},\n\nWelcome to FurniCraft! We're excited to have you on board.\n\nBest regards,\nFurniCraft Team`;
    const html = `
        <h1>Welcome to FurniCraft</h1>
        <p>Hi ${user.firstName},</p>
        <p>Welcome to FurniCraft! We're excited to have you on board.</p>
        <p>Best regards,<br>FurniCraft Team</p>
    `;

    return sendEmail({
        email: user.email,
        subject,
        message,
        html
    });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = 'Password Reset Request';
    const message = `You are receiving this email because you (or someone else) has requested to reset the password for your account.\n\nPlease click on the following link to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;
    const html = `
        <h1>Password Reset Request</h1>
        <p>You are receiving this email because you (or someone else) has requested to reset the password for your account.</p>
        <p>Please click on the following link to reset your password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
    `;

    return sendEmail({
        email: user.email,
        subject,
        message,
        html
    });
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (user, order) => {
    const subject = 'Order Confirmation';
    const message = `Hi ${user.firstName},\n\nThank you for your order! Your order has been confirmed and will be processed shortly.\n\nOrder ID: ${order._id}\nTotal Amount: $${order.totalPrice}\n\nBest regards,\nFurniCraft Team`;
    const html = `
        <h1>Order Confirmation</h1>
        <p>Hi ${user.firstName},</p>
        <p>Thank you for your order! Your order has been confirmed and will be processed shortly.</p>
        <p>Order ID: ${order._id}</p>
        <p>Total Amount: $${order.totalPrice}</p>
        <p>Best regards,<br>FurniCraft Team</p>
    `;

    return sendEmail({
        email: user.email,
        subject,
        message,
        html
    });
};

// Send order shipped email
const sendOrderShippedEmail = async (user, order) => {
    const subject = 'Your Order Has Been Shipped';
    const message = `Hi ${user.firstName},\n\nYour order has been shipped!\n\nOrder ID: ${order._id}\nTracking Number: ${order.trackingNumber}\n\nBest regards,\nFurniCraft Team`;
    const html = `
        <h1>Your Order Has Been Shipped</h1>
        <p>Hi ${user.firstName},</p>
        <p>Your order has been shipped!</p>
        <p>Order ID: ${order._id}</p>
        <p>Tracking Number: ${order.trackingNumber}</p>
        <p>Best regards,<br>FurniCraft Team</p>
    `;

    return sendEmail({
        email: user.email,
        subject,
        message,
        html
    });
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendOrderConfirmationEmail,
    sendOrderShippedEmail
}; 