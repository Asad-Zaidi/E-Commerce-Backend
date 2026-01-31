const Order = require('../models/Order');
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
});

// Send email notification helper
const sendEmailNotification = async (order, status) => {
    try {
        let subject = '';
        let message = '';

        if (status === 'confirmed') {
            subject = '✅ Your Order Has Been Confirmed';
            message = `<h2>Order Confirmed!</h2>
                <p>Dear ${order.customerName},</p>
                <p>Your order (ID: <strong>${order._id}</strong>) has been confirmed.</p>
                <p><strong>Items:</strong></p>
                <ul>
                    ${order.items.map(item => `<li>${item.productName} - Rs. ${item.price}</li>`).join('')}
                </ul>
                <p><strong>Total: Rs. ${order.total}</strong></p>
                <p>You will receive your credentials/access details shortly.</p>`;
        } else if (status === 'completed') {
            subject = '🎉 Your Order is Complete - Check Your Email for Credentials';
            message = `<h2>Order Complete!</h2>
                <p>Dear ${order.customerName},</p>
                <p>Your order (ID: <strong>${order._id}</strong>) has been completed successfully!</p>
                <p><strong>Ordered Items:</strong></p>
                <ul>
                    ${order.items.map(item => `<li><strong>${item.productName}</strong> - ${item.selectedPlan || 'Standard'} (${item.accessType || 'Direct Access'})</li>`).join('')}
                </ul>
                <p style="background-color: #e0f2fe; padding: 15px; border-radius: 5px; border-left: 4px solid #0284c7;">
                    <strong>📧 Check your email for ${order.items.map(item => item.productName).join(', ')} credentials and access details!</strong>
                </p>
                <p>If you don't see your credentials in the next few minutes, please check your spam folder.</p>
                <p>Thank you for your purchase!</p>`;
        } else if (status === 'cancelled') {
            subject = '❌ Your Order Has Been Cancelled';
            message = `<h2>Order Cancelled</h2>
                <p>Dear ${order.customerName},</p>
                <p>Your order (ID: <strong>${order._id}</strong>) has been cancelled.</p>
                <p>If you have any questions, please contact us.</p>`;
        }

        if (subject && message) {
            await transporter.sendMail({
                from: process.env.GMAIL_USER,
                to: order.customerEmail,
                subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
                        ${message}
                        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
                        <p style="color: #666; font-size: 12px; text-align: center;">
                            E-Commerce Website © 2024 - All Rights Reserved
                        </p>
                    </div>
                `,
            });
            console.log(`✅ Email sent to ${order.customerEmail} for status: ${status}`);
        }
    } catch (err) {
        console.error('❌ Error sending email:', err);
        // Don't throw error - continue processing
    }
};

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

        // Send email notification
        await sendEmailNotification(order, status);

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
