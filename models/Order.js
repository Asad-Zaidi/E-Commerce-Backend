const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    selectedPlan: String,
    accessType: String,
    billingPeriod: String,
});

const orderSchema = new mongoose.Schema({
    // Customer Info
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    
    // Billing Info
    company: String,
    country: { type: String, default: 'Pakistan' },
    city: { type: String, required: true },
    address: { type: String, required: true },
    
    // Items
    items: [orderItemSchema],
    
    // Totals
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    processingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    
    // Payment
    paymentMethod: { type: String, enum: ['wallet', 'card'], default: 'wallet' },
    couponCode: String,
    
    // Notes
    note: String,
    
    // Status
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
