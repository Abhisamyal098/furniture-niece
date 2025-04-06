const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/orderController');

// Public routes
// None

// Protected routes
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.post('/', protect, createOrder);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router; 