const mongoose = require('mongoose');

const NavigationSchema = new mongoose.Schema({
    websiteTitle: { type: String, required: true },
    navLinks: [{ name: String, url: String }],
    footerLogoUrl: { type: String },
    cloudinaryFooterLogoId: { type: String },
    footerText: { type: String },
    footerLinks: [{ name: String, url: String }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Navigation', NavigationSchema);