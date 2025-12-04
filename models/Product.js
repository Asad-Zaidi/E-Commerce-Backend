const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    seoDescription: { type: String },
    category: { type: String, required: true },
    priceMonthly: { type: Number },
    priceYearly: { type: Number },
    priceShared: { type: Number },
    pricePrivate: { type: Number },
    imageUrl: { type: String },
    cloudinaryPublicId: { type: String },
    viewCount: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    slug: { type: String, unique: true }
});

ProductSchema.pre('save', function (next) {
    if (this.isModified('name') || this.isModified('category') || !this.slug) {
        const nameSlug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
        const categorySlug = this.category.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
        this.slug = `${categorySlug}/${nameSlug}`;
    }
    next();
});

module.exports = mongoose.model('Product', ProductSchema);
