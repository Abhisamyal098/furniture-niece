const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

// Public routes
router.get('/product/:productId', getReviews);
router.get('/:id', getReview);

// Protected routes
router.post('/product/:productId', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router; 