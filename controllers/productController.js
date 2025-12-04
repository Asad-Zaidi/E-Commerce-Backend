const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');
const { generateSEODescription } = require("../services/aiService");

const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            seoDescription,
            category,
            priceMonthly,
            priceYearly,
            priceShared,
            pricePrivate,
        } = req.body;

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
            category,
            priceMonthly: priceMonthly != null ? Number(priceMonthly) : undefined,
            priceYearly: priceYearly != null ? Number(priceYearly) : undefined,
            priceShared: priceShared != null ? Number(priceShared) : undefined,
            pricePrivate: pricePrivate != null ? Number(pricePrivate) : undefined,
            imageUrl,
            cloudinaryPublicId: publicId,
        });

        console.log("✅ Product Created Successfully:", product.name);
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
        ["priceMonthly", "priceYearly", "priceShared", "pricePrivate"].forEach((key) => {
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
            .select("name category priceMonthly priceYearly priceShared pricePrivate imageUrl avgRating totalReviews slug");

        // Ensure all price fields are always defined
        const response = products.map(product => ({
            ...product._doc,
            priceMonthly: product.priceMonthly != null ? product.priceMonthly : 0,
            priceYearly: product.priceYearly != null ? product.priceYearly : 0,
            priceShared: product.priceShared != null ? product.priceShared : 0,
            pricePrivate: product.pricePrivate != null ? product.pricePrivate : 0,
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

module.exports = {
    getPopularProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    listProducts,
    getProduct,
    getProductBySlug,
    generateSEODescriptionController,
    generateTempSEODescription
};
