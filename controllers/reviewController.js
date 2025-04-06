const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response');
const { validateRating } = require('../utils/validator');

// Get all reviews for a product
exports.getReviews = async (req, res) => {
    try {
        const { productId } = req.params;
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
        const reviews = await Review.find({ product: productId })
            .sort(sortQuery)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('user', 'firstName lastName');

        const total = await Review.countDocuments({ product: productId });

        sendSuccess(res, {
            reviews,
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

// Get single review
exports.getReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('user', 'firstName lastName')
            .populate('product', 'name');

        if (!review) {
            return sendNotFound(res, 'Review not found');
        }

        sendSuccess(res, review);
    } catch (error) {
        sendError(res, error.message);
    }
};

// Create review
exports.createReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;

        // Validate rating
        if (!validateRating(rating)) {
            return sendError(res, 'Rating must be between 1 and 5', 400);
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return sendNotFound(res, 'Product not found');
        }

        // Check if user has purchased the product
        const order = await Order.findOne({
            user: req.user.id,
            'orderItems.product': productId,
            status: 'delivered'
        });

        if (!order) {
            return sendError(res, 'You must purchase the product before reviewing it', 400);
        }

        // Check if user has already reviewed the product
        const existingReview = await Review.findOne({
            user: req.user.id,
            product: productId
        });

        if (existingReview) {
            return sendError(res, 'You have already reviewed this product', 400);
        }

        // Create review
        const review = await Review.create({
            user: req.user.id,
            product: productId,
            rating,
            comment
        });

        // Update product rating
        const reviews = await Review.find({ product: productId });
        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        product.rating = totalRating / reviews.length;
        await product.save();

        sendSuccess(res, review, 'Review created successfully', 201);
    } catch (error) {
        sendError(res, error.message);
    }
};

// Update review
exports.updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        // Validate rating
        if (rating && !validateRating(rating)) {
            return sendError(res, 'Rating must be between 1 and 5', 400);
        }

        // Get review
        const review = await Review.findById(req.params.id);
        if (!review) {
            return sendNotFound(res, 'Review not found');
        }

        // Check if user is authorized
        if (review.user.toString() !== req.user.id) {
            return sendError(res, 'Not authorized to update this review', 403);
        }

        // Update review
        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        await review.save();

        // Update product rating
        const product = await Product.findById(review.product);
        const reviews = await Review.find({ product: product._id });
        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        product.rating = totalRating / reviews.length;
        await product.save();

        sendSuccess(res, review, 'Review updated successfully');
    } catch (error) {
        sendError(res, error.message);
    }
};

// Delete review
exports.deleteReview = async (req, res) => {
    try {
        // Get review
        const review = await Review.findById(req.params.id);
        if (!review) {
            return sendNotFound(res, 'Review not found');
        }

        // Check if user is authorized
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return sendError(res, 'Not authorized to delete this review', 403);
        }

        // Delete review
        await review.remove();

        // Update product rating
        const product = await Product.findById(review.product);
        const reviews = await Review.find({ product: product._id });
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            product.rating = totalRating / reviews.length;
        } else {
            product.rating = 0;
        }
        await product.save();

        sendSuccess(res, null, 'Review deleted successfully');
    } catch (error) {
        sendError(res, error.message);
    }
};

// Get product reviews
exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'firstName lastName')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 