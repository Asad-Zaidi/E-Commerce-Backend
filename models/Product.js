const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    seoDescription: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    category: { type: String, required: true },
    priceSharedMonthly: { type: Number },
    priceSharedYearly: { type: Number },
    privatePriceMonthly: { type: Number },
    privatePriceYearly: { type: Number },
    imageUrl: { type: String },
    cloudinaryPublicId: { type: String },
    viewCount: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    slug: { type: String, unique: true }
});

ProductSchema.pre('save', async function (next) {
    if (this.name && this.category) {
        if (this.isModified('name') || this.isModified('category') || !this.slug) {
            try {
                const nameSlug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
                const categorySlug = this.category.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
                this.slug = `${categorySlug}/${nameSlug}`;
            } catch (error) {
                throw error;
            }
        }
    }
});

module.exports = mongoose.model('Product', ProductSchema);
