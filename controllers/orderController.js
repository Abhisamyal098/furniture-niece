const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response');
const { validatePrice } = require('../utils/validator');
const { createPaymentIntent } = require('../utils/stripe');
const { sendOrderConfirmationEmail, sendOrderShippedEmail } = require('../utils/email');

// Get all orders
exports.getOrders = async (req, res) => {
    try {
        const { status, sort, page = 1, limit = 10 } = req.query;

        // Build query
        const query = { user: req.user.id };
        if (status) query.status = status;

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
        const orders = await Order.find(query)
            .sort(sortQuery)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('orderItems.product', 'name images');

        const total = await Order.countDocuments(query);

        sendSuccess(res, {
            orders,
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

// Get single order
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('orderItems.product', 'name images')
            .populate('user', 'firstName lastName email');

        if (!order) {
            return sendNotFound(res, 'Order not found');
        }

        // Check if user is authorized
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return sendError(res, 'Not authorized to access this order', 403);
        }

        sendSuccess(res, order);
    } catch (error) {
        sendError(res, error.message);
    }
};

// Create order
exports.createOrder = async (req, res) => {
    try {
        const {
            shippingAddress,
            paymentMethod,
            deliveryInstructions
        } = req.body;

        // Get cart
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price stock');

        if (!cart || cart.items.length === 0) {
            return sendError(res, 'Cart is empty', 400);
        }

        // Check stock and calculate total
        let totalPrice = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const product = item.product;

            // Check stock
            if (product.stock < item.quantity) {
                return sendError(res, `Not enough stock for ${product.name}`, 400);
            }

            // Calculate item total
            const itemTotal = product.price * item.quantity;
            totalPrice += itemTotal;

            // Add to order items
            orderItems.push({
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                product: product._id
            });

            // Update stock
            product.stock -= item.quantity;
            await product.save();
        }

        // Apply coupon discount if exists
        if (cart.coupon) {
            const discount = (totalPrice * cart.coupon.discount) / 100;
            totalPrice -= discount;
        }

        // Add tax and shipping
        const taxPrice = (totalPrice * 0.1).toFixed(2);
        const shippingPrice = 10;
        totalPrice = Number(totalPrice) + Number(taxPrice) + shippingPrice;

        // Create payment intent if payment method is stripe
        let paymentResult;
        if (paymentMethod === 'stripe') {
            const paymentIntent = await createPaymentIntent(totalPrice);
            paymentResult = {
                id: paymentIntent.id,
                status: paymentIntent.status
            };
        }

        // Create order
        const order = await Order.create({
            user: req.user.id,
            orderItems,
            shippingAddress,
            paymentMethod,
            paymentResult,
            taxPrice,
            shippingPrice,
            totalPrice,
            deliveryInstructions
        });

        // Clear cart
        cart.items = [];
        cart.coupon = undefined;
        await cart.save();

        // Send confirmation email
        await sendOrderConfirmationEmail(req.user, order);

        sendSuccess(res, order, 'Order created successfully', 201);
    } catch (error) {
        sendError(res, error.message);
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Get order
        const order = await Order.findById(req.params.id)
            .populate('user', 'firstName lastName email');

        if (!order) {
            return sendNotFound(res, 'Order not found');
        }

        // Update status
        order.status = status;
        if (status === 'shipped') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();

            // Send shipped email
            await sendOrderShippedEmail(order.user, order);
        }
        await order.save();

        sendSuccess(res, order, 'Order status updated successfully');
    } catch (error) {
        sendError(res, error.message);
    }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        // Get order
        const order = await Order.findById(req.params.id);
        if (!order) {
            return sendNotFound(res, 'Order not found');
        }

        // Check if order can be cancelled
        if (order.status !== 'pending') {
            return sendError(res, 'Order cannot be cancelled', 400);
        }

        // Update status
        order.status = 'cancelled';
        await order.save();

        // Restore stock
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        sendSuccess(res, order, 'Order cancelled successfully');
    } catch (error) {
        sendError(res, error.message);
    }
}; 