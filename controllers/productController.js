const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');
const { generateSEODescription, generateMetaTags } = require("../services/aiService");

const createProduct = async (req, res) => {
    try {
        console.log("📥 Full req.body:", JSON.stringify(req.body, null, 2));
        console.log("📥 req.file:", req.file ? "Present" : "None");
        
        const {
            name,
            description,
            seoDescription,
            metaTitle,
            metaDescription,
            metaKeywords,
            category,
            priceSharedMonthly,
            priceSharedYearly,
            privatePriceMonthly,
            privatePriceYearly,
        } = req.body;
        
        console.log("📊 Extracted prices:", {
            priceSharedMonthly,
            priceSharedYearly,
            privatePriceMonthly,
            privatePriceYearly
        });

        let imageUrl = "", publicId = "";

        // Upload image to Cloudinary if provided
        if (req.file) {
            console.log("🖼 Uploading image to Cloudinary...");

            const streamUpload = (buffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "servicehub" },
                        (error, result) => {
                            if (result) resolve(result);
                            else reject(error);
                        }
                    );
                    stream.end(buffer);
                });
            };

            try {
                const result = await streamUpload(req.file.buffer);
                imageUrl = result.secure_url;
                publicId = result.public_id;
                console.log("✅ Cloudinary Upload Success:", result.secure_url);
            } catch (uploadError) {
                console.error("❌ Cloudinary Upload Failed:", uploadError);
                return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
            }
        } else {
            console.log("⚠️ No image file provided — skipping Cloudinary upload.");
        }

        // Create the product
        const product = await Product.create({
            name,
            description,
            seoDescription,
            metaTitle,
            metaDescription,
            metaKeywords,
            category,
            priceSharedMonthly: priceSharedMonthly != null ? Number(priceSharedMonthly) : undefined,
            priceSharedYearly: priceSharedYearly != null ? Number(priceSharedYearly) : undefined,
            privatePriceMonthly: privatePriceMonthly != null ? Number(privatePriceMonthly) : undefined,
            privatePriceYearly: privatePriceYearly != null ? Number(privatePriceYearly) : undefined,
            imageUrl,
            cloudinaryPublicId: publicId,
        });

        console.log("✅ Product Created:", {
            name: product.name,
            priceSharedMonthly: product.priceSharedMonthly,
            priceSharedYearly: product.priceSharedYearly,
            privatePriceMonthly: product.privatePriceMonthly,
            privatePriceYearly: product.privatePriceYearly
        });
        
        // Verify by fetching from database
        const savedProduct = await Product.findById(product._id).lean();
        console.log("🔍 Product from DB:", {
            name: savedProduct.name,
            priceSharedMonthly: savedProduct.priceSharedMonthly,
            priceSharedYearly: savedProduct.priceSharedYearly,
            privatePriceMonthly: savedProduct.privatePriceMonthly,
            privatePriceYearly: savedProduct.privatePriceYearly
        });
        
        res.json(product);
    } catch (err) {
        console.error("❌ Product Creation Error:", err);
        res.status(500).json({ message: err.message });
    }
};


const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        let updates = { ...req.body };

        // Handle image upload to Cloudinary if provided
        if (req.file) {
            if (product.cloudinaryPublicId) {
                await cloudinary.uploader.destroy(product.cloudinaryPublicId);
            }
            const streamUpload = (buffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'servicehub' },
                        (error, result) => (result ? resolve(result) : reject(error))
                    );
                    stream.end(buffer);
                });
            };
            const result = await streamUpload(req.file.buffer);
            updates.imageUrl = result.secure_url;
            updates.cloudinaryPublicId = result.public_id;
        }

        // Convert price fields to Number if they are not null/undefined
        ["priceSharedMonthly", "priceSharedYearly", "privatePriceMonthly", "privatePriceYearly"].forEach((key) => {
            if (updates[key] != null) updates[key] = Number(updates[key]);
        });

        // Apply updates to the document
        Object.assign(product, updates);
        
        // Save to trigger the pre-save hook which regenerates the slug
        const updated = await product.save();
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};


const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        if (product.cloudinaryPublicId) {
            await cloudinary.uploader.destroy(product.cloudinaryPublicId);
        }

        await Product.findByIdAndDelete(id);
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const listProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ createdAt: -1 })
            .select("name category priceSharedMonthly priceSharedYearly privatePriceMonthly privatePriceYearly imageUrl avgRating totalReviews slug");

        // Ensure all price fields are always defined
        const response = products.map(product => ({
            ...product._doc,
            priceSharedMonthly: product.priceSharedMonthly != null ? product.priceSharedMonthly : 0,
            priceSharedYearly: product.priceSharedYearly != null ? product.priceSharedYearly : 0,
            privatePriceMonthly: product.privatePriceMonthly != null ? product.privatePriceMonthly : 0,
            privatePriceYearly: product.privatePriceYearly != null ? product.privatePriceYearly : 0,
            avgRating: product.avgRating || 0,
            totalReviews: product.totalReviews || 0,
        }));

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};


const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        product.viewCount = (product.viewCount || 0) + 1;
        await product.save();

        const response = {
            ...product._doc,
            priceMonthly: product.priceMonthly != null ? product.priceMonthly : 0,
            priceYearly: product.priceYearly != null ? product.priceYearly : 0,
            priceShared: product.priceShared != null ? product.priceShared : 0,
            pricePrivate: product.pricePrivate != null ? product.pricePrivate : 0,
            avgRating: product.avgRating || 0,
            totalReviews: product.totalReviews || 0,
        };

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const getPopularProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ avgRating: -1 })
            .limit(6);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching popular products:", error);
        res.status(500).json({ message: "Failed to fetch popular products" });
    }
};


const getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug });
        if (!product) return res.status(404).json({ message: "Product not found" });

        product.viewCount = (product.viewCount || 0) + 1;
        await product.save();

        const response = {
            ...product._doc,
            priceMonthly: product.priceMonthly != null ? product.priceMonthly : 0,
            priceYearly: product.priceYearly != null ? product.priceYearly : 0,
            priceShared: product.priceShared != null ? product.priceShared : 0,
            pricePrivate: product.pricePrivate != null ? product.pricePrivate : 0,
            avgRating: product.avgRating || 0,
            totalReviews: product.totalReviews || 0,
        };

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const generateSEODescriptionController = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) return res.status(404).json({ message: "Product not found" });

        const seoText = await generateSEODescription(product);

        product.seoDescription = seoText;
        await product.save();

        res.json({
            success: true,
            seoDescription: seoText
        });

    } catch (err) {
        console.error("SEO Generation Error:", err);
        res.status(500).json({ message: err.message });
    }
};

const generateTempSEODescription = async (req, res) => {
    try {
        const { name, category, description } = req.body;

        // Create a temporary product object for SEO generation
        const tempProduct = {
            name,
            category,
            description
        };

        const seoText = await generateSEODescription(tempProduct);

        res.json({
            success: true,
            seoDescription: seoText
        });

    } catch (err) {
        console.error("Temp SEO Generation Error:", err);
        res.status(500).json({ message: err.message });
    }
};

const generateTempMetaTags = async (req, res) => {
    try {
        const { name, category, description } = req.body;

        const tempProduct = {
            name,
            category,
            description
        };

        const metaTags = await generateMetaTags(tempProduct);

        res.json({
            success: true,
            ...metaTags
        });

    } catch (err) {
        console.error("Meta Tags Generation Error:", err);
        res.status(500).json({ message: err.message });
    }
};

const generateSitemap = async (req, res) => {
    try {
        const products = await Product.find().select('slug updatedAt imageUrl');
        
        const baseURL = process.env.FRONTEND_URL || 'https://yourdomain.com';
        
        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
        
        // Add static pages
        const staticPages = [
            { loc: '/', priority: '1.0', changefreq: 'weekly' },
            { loc: '/products', priority: '0.9', changefreq: 'daily' },
            { loc: '/about', priority: '0.7', changefreq: 'monthly' },
            { loc: '/contact', priority: '0.7', changefreq: 'monthly' }
        ];
        
        staticPages.forEach(page => {
            sitemap += '  <url>\n';
            sitemap += `    <loc>${baseURL}${page.loc}</loc>\n`;
            sitemap += `    <priority>${page.priority}</priority>\n`;
            sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
            sitemap += '  </url>\n';
        });
        
        // Add product pages with images
        products.forEach(product => {
            sitemap += '  <url>\n';
            sitemap += `    <loc>${baseURL}/products/${product.slug}</loc>\n`;
            sitemap += `    <lastmod>${product.updatedAt?.toISOString().split('T')[0]}</lastmod>\n`;
            sitemap += '    <priority>0.8</priority>\n';
            sitemap += '    <changefreq>weekly</changefreq>\n';
            
            // Add image tag if product has image
            if (product.imageUrl) {
                sitemap += '    <image:image>\n';
                sitemap += `      <image:loc>${product.imageUrl}</image:loc>\n`;
                sitemap += `      <image:title>${product.name || 'Product Image'}</image:title>\n`;
                sitemap += '    </image:image>\n';
            }
            
            sitemap += '  </url>\n';
        });
        
        sitemap += '</urlset>';
        
        res.type('application/xml').send(sitemap);
    } catch (err) {
        console.error("Sitemap Generation Error:", err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getPopularProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    listProducts,
    getProduct,
    getProductBySlug,
    generateSEODescriptionController,
    generateTempSEODescription,
    generateTempMetaTags,
    generateSitemap
};
