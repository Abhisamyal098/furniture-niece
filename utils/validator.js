const { validationResult } = require('express-validator');

// Validate request
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: errors.array()
        });
    }
    next();
};

// Validate email
const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

// Validate password
const validatePassword = (password) => {
    // Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
};

// Validate phone number
const validatePhone = (phone) => {
    // Phone number must be 10 digits long and start with a valid country code
    const re = /^\+?[1-9]\d{1,14}$/;
    return re.test(phone);
};

// Validate URL
const validateUrl = (url) => {
    const re = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return re.test(url);
};

// Validate date
const validateDate = (date) => {
    const re = /^\d{4}-\d{2}-\d{2}$/;
    return re.test(date) && !isNaN(Date.parse(date));
};

// Validate time
const validateTime = (time) => {
    const re = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return re.test(time);
};

// Validate price
const validatePrice = (price) => {
    const re = /^\d+(\.\d{1,2})?$/;
    return re.test(price) && price > 0;
};

// Validate quantity
const validateQuantity = (quantity) => {
    const re = /^\d+$/;
    return re.test(quantity) && quantity > 0;
};

// Validate rating
const validateRating = (rating) => {
    const re = /^[1-5]$/;
    return re.test(rating);
};

// Validate discount
const validateDiscount = (discount) => {
    const re = /^\d+(\.\d{1,2})?$/;
    return re.test(discount) && discount >= 0 && discount <= 100;
};

module.exports = {
    validateRequest,
    validateEmail,
    validatePassword,
    validatePhone,
    validateUrl,
    validateDate,
    validateTime,
    validatePrice,
    validateQuantity,
    validateRating,
    validateDiscount
}; 