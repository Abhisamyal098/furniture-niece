const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response');
const { validatePrice, validateQuantity } = require('../utils/validator');

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const { category, subcategory, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

        // Build query
        const query = {};
        if (category) query.category = category;
        if (subcategory) query.subcategory = subcategory;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = minPrice;
            if (maxPrice) query.price.$lte = maxPrice;
        }

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
        const products = await Product.find(query)
            .sort(sortQuery)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('category', 'name')
            .populate('subcategory', 'name');

        const total = await Product.countDocuments(query);

        sendSuccess(res, {
            products,
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

// Get single product
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .populate('reviews');

        if (!product) {
            return sendNotFound(res, 'Product not found');
        }

        sendSuccess(res, product);
    } catch (error) {
        sendError(res, error.message);
    }
};

// Create product
exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discount,
            category,
            subcategory,
            stock,
            dimensions,
            weight,
            materials,
            colors,
            features,
            isFeatured
        } = req.body;

        // Validate price
        if (!validatePrice(price)) {
            return sendValidationError(res, 'Please provide a valid price');
        }

        // Validate stock
        if (!validateQuantity(stock)) {
            return sendValidationError(res, 'Please provide a valid stock quantity');
        }

        // Upload images
        const images = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await uploadImage(file.path);
                images.push({
                    url: result.url,
                    public_id: result.public_id
                });
            }
        }

        // Create product
        const product = await Product.create({
            name,
            description,
            price,
            discount,
            category,
            subcategory,
            images,
            stock,
            dimensions,
            weight,
            materials,
            colors,
            features,
            isFeatured
        });

        sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error) {
        sendError(res, error.message);
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discount,
            category,
            subcategory,
            stock,
            dimensions,
            weight,
            materials,
            colors,
            features,
            isFeatured
        } = req.body;

        // Validate price
        if (price && !validatePrice(price)) {
            return sendValidationError(res, 'Please provide a valid price');
        }

        // Validate stock
        if (stock && !validateQuantity(stock)) {
            return sendValidationError(res, 'Please provide a valid stock quantity');
        }

        // Get product
        const product = await Product.findById(req.params.id);
        if (!product) {
            return sendNotFound(res, 'Product not found');
        }

        // Handle image updates
        if (req.files && req.files.length > 0) {
            // Delete old images
            for (const image of product.images) {
                await deleteImage(image.public_id);
            }

            // Upload new images
            const images = [];
            for (const file of req.files) {
                const result = await uploadImage(file.path);
                images.push({
                    url: result.url,
                    public_id: result.public_id
                });
            }
            product.images = images;
        }

        // Update product
        Object.assign(product, {
            name,
            description,
            price,
            discount,
            category,
            subcategory,
            stock,
            dimensions,
            weight,
            materials,
            colors,
            features,
            isFeatured
        });

        await product.save();

        sendSuccess(res, product, 'Product updated successfully');
    } catch (error) {
        sendError(res, error.message);
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return sendNotFound(res, 'Product not found');
        }

        // Delete images
        for (const image of product.images) {
            await deleteImage(image.public_id);
        }

        await product.remove();

        sendSuccess(res, null, 'Product deleted successfully');
    } catch (error) {
        sendError(res, error.message);
    }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isFeatured: true })
            .limit(10)
            .populate('category', 'name')
            .populate('subcategory', 'name');

        sendSuccess(res, products);
    } catch (error) {
        sendError(res, error.message);
    }
};

// Create product review
exports.createReview = async (req, res) => {
    try {
        const { rating, title, comment } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user has already reviewed this product
        const alreadyReviewed = product.reviews.find(
            review => review.user.toString() === req.user.id
        );

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: 'Product already reviewed'
            });
        }

        // Create review
        const review = await Review.create({
            user: req.user.id,
            product: req.params.id,
            rating,
            title,
            comment
        });

        // Add review to product
        product.reviews.push(review);
        await product.save();

        res.status(201).json({
            success: true,
            review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 