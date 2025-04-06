const Coupon = require('../models/Coupon');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response');
const { validateDiscount } = require('../utils/validator');

// Get all coupons
exports.getCoupons = async (req, res) => {
    try {
        const { sort, page = 1, limit = 10 } = req.query;

        // Build sort
        let sortQuery = {};
        if (sort) {
            const sortFields = sort.split(',');
            sortFields.forEach(field => {
                const [key, value] = field.split(':');
                sortQuery[key] = value === 'desc' ? -1 : 1;
            });
        } else {
            sortQuery = { createdAt: -1 };
        }

        // Execute query
        const coupons = await Coupon.find()
            .sort(sortQuery)
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Coupon.countDocuments();

        sendSuccess(res, {
            coupons,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        sendError(res, error.message);
    }
};

// Get single coupon
exports.getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return sendNotFound(res, 'Coupon not found');
        }

        sendSuccess(res, coupon);
    } catch (error) {
        sendError(res, error.message);
    }
};

// Create coupon
exports.createCoupon = async (req, res) => {
    try {
        const {
            code,
            discount,
            minPurchase,
            maxDiscount,
            startDate,
            endDate,
            usageLimit,
            isActive
        } = req.body;

        // Validate discount
        if (!validateDiscount(discount)) {
            return sendError(res, 'Discount must be between 1 and 100', 400);
        }

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) {
            return sendError(res, 'Coupon code already exists', 400);
        }

        // Create coupon
        const coupon = await Coupon.create({
            code,
            discount,
            minPurchase,
            maxDiscount,
            startDate,
            endDate,
            usageLimit,
            isActive
        });

        sendSuccess(res, coupon, 'Coupon created successfully', 201);
    } catch (error) {
        sendError(res, error.message);
    }
};

// Update coupon
exports.updateCoupon = async (req, res) => {
    try {
        const {
            code,
            discount,
            minPurchase,
            maxDiscount,
            startDate,
            endDate,
            usageLimit,
            isActive
        } = req.body;

        // Validate discount
        if (discount && !validateDiscount(discount)) {
            return sendError(res, 'Discount must be between 1 and 100', 400);
        }

        // Get coupon
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return sendNotFound(res, 'Coupon not found');
        }

        // Check if new code already exists
        if (code && code !== coupon.code) {
            const existingCoupon = await Coupon.findOne({ code });
            if (existingCoupon) {
                return sendError(res, 'Coupon code already exists', 400);
            }
        }

        // Update coupon
        coupon.code = code || coupon.code;
        coupon.discount = discount || coupon.discount;
        coupon.minPurchase = minPurchase || coupon.minPurchase;
        coupon.maxDiscount = maxDiscount || coupon.maxDiscount;
        coupon.startDate = startDate || coupon.startDate;
        coupon.endDate = endDate || coupon.endDate;
        coupon.usageLimit = usageLimit || coupon.usageLimit;
        coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;
        await coupon.save();

        sendSuccess(res, coupon, 'Coupon updated successfully');
    } catch (error) {
        sendError(res, error.message);
    }
};

// Delete coupon
exports.deleteCoupon = async (req, res) => {
    try {
        // Get coupon
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return sendNotFound(res, 'Coupon not found');
        }

        // Delete coupon
        await coupon.remove();

        sendSuccess(res, null, 'Coupon deleted successfully');
    } catch (error) {
        sendError(res, error.message);
    }
};

// Validate coupon
exports.validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        // Get coupon
        const coupon = await Coupon.findOne({ code });
        if (!coupon) {
            return sendNotFound(res, 'Coupon not found');
        }

        // Check if coupon is active
        if (!coupon.isActive) {
            return sendError(res, 'Coupon is not active', 400);
        }

        // Check if coupon has expired
        if (coupon.endDate && coupon.endDate < Date.now()) {
            return sendError(res, 'Coupon has expired', 400);
        }

        // Check if coupon has reached usage limit
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return sendError(res, 'Coupon has reached usage limit', 400);
        }

        sendSuccess(res, coupon, 'Coupon is valid');
    } catch (error) {
        sendError(res, error.message);
    }
}; 