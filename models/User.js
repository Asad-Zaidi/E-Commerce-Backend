const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin','user'], default: 'user' },
  resetPasswordOtp: { type: String, default: null },
  resetPasswordOtpExpire: { type: Date, default: null },
  cart: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    quantity: { type: Number, required: true, default: 1 }
  }]
}, { timestamps: true });

// Generate OTP for password reset
UserSchema.methods.generatePasswordResetOtp = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    this.resetPasswordOtp = otp;
    this.resetPasswordOtpExpire = Date.now() + 10 * (60 * 1000); // 10 minutes expiration
    
    return otp;
};

module.exports = mongoose.model('User', UserSchema);
