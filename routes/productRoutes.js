const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const upload = require('../middlewares/upload');
const Product = require('../models/Product');

router.get('/', productController.listProducts);
router.get('/popular', productController.getPopularProducts);
router.get(/^\/slug\/(.+)$/, async (req, res) => {
    try {
        const slug = req.params[0];
        const product = await Product.findOne({ slug: slug });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get('/:id', productController.getProduct);
router.get('/reviews/slug/:slug', reviewController.getReviewsByProductSlug);
router.post('/', upload.single('image'), productController.createProduct);
router.put('/:id', upload.single('image'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post("/:id/generate-seo", productController.generateSEODescriptionController);
router.post("/temp/generate-seo", productController.generateTempSEODescription);

module.exports = router;
