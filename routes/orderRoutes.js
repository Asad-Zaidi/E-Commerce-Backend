const express = require('express');
const router = express.Router();
const {
    createOrder,
    getAllOrders,
    getOrderById,
    getOrderStats,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/orderController');

// Create order (public)
router.post('/', createOrder);

// Get order statistics (public for now - can add auth later)
router.get('/stats', getOrderStats);

// Get single order
router.get('/:id', getOrderById);

// Get all orders
router.get('/', getAllOrders);

// Update order status
router.put('/:id', updateOrderStatus);

// Delete order
router.delete('/:id', deleteOrder);

module.exports = router;
