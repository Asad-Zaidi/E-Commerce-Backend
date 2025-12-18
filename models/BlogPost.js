const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    author: { type: String, default: 'Admin' },
    category: { type: String, required: true },
    tags: [{ type: String }],
    imageUrl: { type: String },
    cloudinaryPublicId: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    published: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Auto-generate slug from title
BlogPostSchema.pre('save', function (next) {
    if (this.isModified('title') || !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);
