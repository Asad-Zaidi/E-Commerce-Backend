const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const BlogPost = require('../models/BlogPost');

// Generate dynamic sitemap
router.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = process.env.FRONTEND_URL || 'https://subscription-service-mu.vercel.app';
        const currentDate = new Date().toISOString().split('T')[0];

        // Fetch all products, categories, and blog posts
        const products = await Product.find({}).select('slug updatedAt');
        const categories = await Category.find({}).select('name updatedAt');
        const blogPosts = await BlogPost.find({ published: true }).select('slug updatedAt');

        // Start XML
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Home page
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>1.0</priority>\n';
        xml += '  </url>\n';

        // Products listing page
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/products</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>0.9</priority>\n';
        xml += '  </url>\n';

        // Category pages
        categories.forEach(category => {
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}/products?category=${encodeURIComponent(category.name)}</loc>\n`;
            xml += `    <lastmod>${category.updatedAt ? category.updatedAt.toISOString().split('T')[0] : currentDate}</lastmod>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });

        // Individual product pages
        products.forEach(product => {
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}/products/${product.slug}</loc>\n`;
            xml += `    <lastmod>${product.updatedAt ? product.updatedAt.toISOString().split('T')[0] : currentDate}</lastmod>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.7</priority>\n';
            xml += '  </url>\n';
        });

        // About page
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/about</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.6</priority>\n';
        xml += '  </url>\n';

        // Contact page
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/contact</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';
        xml += '  </url>\n';

        // Blog listing page
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/blog</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';

        // Individual blog posts
        blogPosts.forEach(post => {
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
            xml += `    <lastmod>${post.updatedAt ? post.updatedAt.toISOString().split('T')[0] : currentDate}</lastmod>\n`;
            xml += '    <changefreq>monthly</changefreq>\n';
            xml += '    <priority>0.7</priority>\n';
            xml += '  </url>\n';
        });

        // Close XML
        xml += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        console.error('Error generating sitemap:', err);
        res.status(500).send('Error generating sitemap');
    }
});

module.exports = router;
