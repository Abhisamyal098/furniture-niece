// Send success response
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

// Send error response
const sendError = (res, message = 'Error', statusCode = 400) => {
    res.status(statusCode).json({
        success: false,
        message
    });
};

// Send validation error response
const sendValidationError = (res, errors) => {
    res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
    });
};

// Send not found response
const sendNotFound = (res, message = 'Resource not found') => {
    res.status(404).json({
        success: false,
        message
    });
};

// Send unauthorized response
const sendUnauthorized = (res, message = 'Not authorized to access this route') => {
    res.status(401).json({
        success: false,
        message
    });
};

// Send forbidden response
const sendForbidden = (res, message = 'Forbidden') => {
    res.status(403).json({
        success: false,
        message
    });
};

module.exports = {
    sendSuccess,
    sendError,
    sendValidationError,
    sendNotFound,
    sendUnauthorized,
    sendForbidden
}; 