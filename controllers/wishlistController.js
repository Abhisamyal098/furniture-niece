const User = require('../models/User');
const Product = require('../models/Product');

// Get wishlist
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('wishlist.product', 'name price images');

        res.status(200).json({
            success: true,
            wishlist: user.wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if product is already in wishlist
        const user = await User.findById(req.user.id);
        const existingItem = user.wishlist.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        // Add to wishlist
        user.wishlist.push({ product: productId });
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Product added to wishlist'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Remove from wishlist
        const user = await User.findById(req.user.id);
        user.wishlist = user.wishlist.filter(
            item => item.product.toString() !== productId
        );
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Product removed from wishlist'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.wishlist = [];
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Wishlist cleared'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 