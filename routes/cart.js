const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getCart,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon
} = require('../controllers/cartController');

// Protected routes
router.get('/', protect, getCart);
router.post('/items', protect, addItem);
router.put('/items/:id', protect, updateItemQuantity);
router.delete('/items/:id', protect, removeItem);
router.delete('/', protect, clearCart);
router.post('/coupon', protect, applyCoupon);
router.delete('/coupon', protect, removeCoupon);

module.exports = router; 