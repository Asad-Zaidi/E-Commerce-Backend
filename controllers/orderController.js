const Order = require('../models/Order');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const {
            customerName,
            customerEmail,
            customerPhone,
            company,
            country,
            city,
            address,
            items,
            subtotal,
            discount,
            processingFee,
            total,
            paymentMethod,
            couponCode,
            note,
        } = req.body;

        // Validate required fields
        if (!customerName || !customerEmail || !customerPhone || !city || !address || !items || items.length === 0) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const order = new Order({
            customerName,
            customerEmail,
            customerPhone,
            company,
            country,
            city,
            address,
            items,
            subtotal,
            discount,
            processingFee,
            total,
            paymentMethod,
            couponCode,
            note,
            status: 'pending',
        });

        await order.save();
        res.status(201).json({ message: 'Order created successfully', order });
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Error creating order', error: err.message });
    }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Error fetching orders', error: err.message });
    }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ message: 'Error fetching order', error: err.message });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: Date.now() },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order status updated', order });
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ message: 'Error updating order', error: err.message });
    }
};

// Delete order
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ message: 'Error deleting order', error: err.message });
    }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]);
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const completedOrders = await Order.countDocuments({ status: 'completed' });

        res.json({
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            pendingOrders,
            completedOrders,
        });
    } catch (err) {
        console.error('Error fetching order stats:', err);
        res.status(500).json({ message: 'Error fetching statistics', error: err.message });
    }
};
