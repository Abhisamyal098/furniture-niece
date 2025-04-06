const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response');
const { validateQuantity } = require('../utils/validator');

// Get cart
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price images');

        if (!cart) {
            return sendSuccess(res, {
                items: [],
                totalItems: 0,
                totalPrice: 0
            });
        }

        sendSuccess(res, cart);
    } catch (error) {
        sendError(res, error.message);
    }
};

// Add item to cart
exports.addItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Validate quantity
        if (!validateQuantity(quantity)) {
            return sendValidationError(res, 'Please provide a valid quantity');
        }

        // Get product
        const product = await Product.findById(productId);
        if (!product) {
            return sendNotFound(res, 'Product not found');
        }

        // Check if product is in stock
        if (product.stock < quantity) {
            return sendError(res, 'Not enough stock available', 400);
        }

        // Get or create cart
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = await Cart.create({ user: req.user.id });
        }

        // Check if item already exists in cart
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            // Update quantity
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity,
                price: product.price
            });
        }

        await cart.save();

        sendSuccess(res, cart, 'Item added to cart successfully');
    } catch (error) {
        sendError(res, error.message);
    }
};

// Update item quantity
exports.updateItemQuantity = async (req, res) => {
    try {
        const { quantity } = req.body;

        // Validate quantity
        if (!validateQuantity(quantity)) {
            return sendValidationError(res, 'Please provide a valid quantity');
        }

        // Get cart
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return sendNotFound(res, 'Cart not found');
        }

        // Check if item exists in cart
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === req.params.id
        );

        if (itemIndex === -1) {
            return sendNotFound(res, 'Item not found in cart');
        }

        // Get product
        const product = await Product.findById(cart.items[itemIndex].product);
        if (!product) {
            return sendNotFound(res, 'Product not found');
        }

        // Check if product is in stock
        if (product.stock < quantity) {
            return sendError(res, 'Not enough stock available', 400);
        }

        // Update quantity
        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        sendSuccess(res, cart, 'Item quantity updated successfully');
    } catch (error) {
        sendError(res, error.message);
    }
};

// Remove item from cart
exports.removeItem = async (req, res) => {
    try {
        // Get cart
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return sendNotFound(res, 'Cart not found');
        }

        // Check if item exists in cart
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === req.params.id
        );

        if (itemIndex === -1) {
            return sendNotFound(res, 'Item not found in cart');
        }

        // Remove item
        cart.items.splice(itemIndex, 1);
        await cart.save();

        sendSuccess(res, cart, 'Item removed from cart successfully');
    } catch (error) {
        sendError(res, error.message);
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        // Get cart
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return sendNotFound(res, 'Cart not found');
        }

        // Clear cart
        cart.items = [];
        await cart.save();

        sendSuccess(res, cart, 'Cart cleared successfully');
    } catch (error) {
        sendError(res, error.message);
    }
};

// Apply coupon
exports.applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        // Get cart
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return sendNotFound(res, 'Cart not found');
        }

        // Get coupon
        const coupon = await Coupon.findOne({
            code,
            isActive: true,
            startDate: { $lte: Date.now() },
            endDate: { $gte: Date.now() }
        });

        if (!coupon) {
            return sendError(res, 'Invalid or expired coupon', 400);
        }

        // Check if coupon is already applied
        if (cart.coupon && cart.coupon.code === code) {
            return sendError(res, 'Coupon already applied', 400);
        }

        // Apply coupon
        cart.coupon = {
            code: coupon.code,
            discount: coupon.discountValue
        };
        await cart.save();

        sendSuccess(res, cart, 'Coupon applied successfully');
    } catch (error) {
        sendError(res, error.message);
    }
};

// Remove coupon
exports.removeCoupon = async (req, res) => {
    try {
        // Get cart
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return sendNotFound(res, 'Cart not found');
        }

        // Check if coupon is applied
        if (!cart.coupon) {
            return sendError(res, 'No coupon applied', 400);
        }

        // Remove coupon
        cart.coupon = undefined;
        await cart.save();

        sendSuccess(res, cart, 'Coupon removed successfully');
    } catch (error) {
        sendError(res, error.message);
    }
}; 