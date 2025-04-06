const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getCoupons,
    getCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon
} = require('../controllers/couponController');

// Public routes
router.get('/', getCoupons);
router.get('/:id', getCoupon);
router.post('/validate', validateCoupon);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), createCoupon);
router.put('/:id', protect, authorize('admin'), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

module.exports = router; 