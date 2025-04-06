const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getMe,
    updateMe,
    updatePassword
} = require('../controllers/userController');

// Public routes
// None

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/me/password', protect, updatePassword);

// Protected routes (admin only)
router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), getUser);
router.post('/', protect, authorize('admin'), createUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router; 