const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'User exists' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed, role: role || 'admin' });
        res.json({ message: 'Admin created', user: { id: user._id, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// User signup
const signup = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed, role: 'user' });
        
        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ 
            message: 'User created successfully',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ 
            token, 
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id || req.body.userId;
        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id || req.body.userId;
        const { name, email } = req.body;
        const user = await User.findByIdAndUpdate(userId, { name, email }, { new: true }).select('-password');
        res.json({ message: 'Profile updated', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Change password (protected)
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id || req.body.userId;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ message: 'New password must be different from current password' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get user cart
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('cart');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ cart: user.cart || [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update user cart
const updateCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { cart } = req.body;
        
        if (!Array.isArray(cart)) {
            return res.status(400).json({ message: 'Cart must be an array' });
        }
        
        const user = await User.findByIdAndUpdate(
            userId, 
            { cart }, 
            { new: true }
        ).select('cart');
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        res.json({ message: 'Cart updated', cart: user.cart });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Clear user cart
const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByIdAndUpdate(
            userId, 
            { cart: [] }, 
            { new: true }
        ).select('cart');
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        res.json({ message: 'Cart cleared', cart: [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { registerAdmin, signup, login, getProfile, updateProfile, changePassword, getCart, updateCart, clearCart };
