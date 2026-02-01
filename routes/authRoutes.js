const express = require('express');
const router = express.Router();
const { registerAdmin, signup, login, getProfile, updateProfile, changePassword, getCart, updateCart, clearCart } = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');

// Only call registerAdmin once to create the first admin (or create admin via MongoDB Atlas UI).
router.post('/register', registerAdmin);

// User signup
router.post('/signup', signup);

// Login (for both admin and users)
router.post('/login', login);

// Get user profile (protected)
router.get('/profile', auth, getProfile);

// Update user profile (protected)
router.put('/profile', auth, updateProfile);

// Change password (protected)
router.put('/change-password', auth, changePassword);

// Cart management (protected)
router.get('/cart', auth, getCart);
router.put('/cart', auth, updateCart);
router.delete('/cart', auth, clearCart);

module.exports = router;
