const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { adminOnly } = require('../middlewares/adminMiddleware');
const auth = require('../middlewares/authMiddleware');

// Public routes
router.get('/posts', blogController.getAllPosts);
router.get('/posts/:slug', blogController.getPostBySlug);
router.get('/categories', blogController.getCategories);
router.get('/popular', blogController.getPopularPosts);

// Admin routes (require authentication)
router.get('/admin/posts', auth, adminOnly, blogController.getAllPostsAdmin);
router.post('/admin/posts', auth, adminOnly, blogController.createPost);
router.put('/admin/posts/:id', auth, adminOnly, blogController.updatePost);
router.delete('/admin/posts/:id', auth, adminOnly, blogController.deletePost);
router.post('/admin/generate-ai', auth, adminOnly, blogController.generateBlogWithAI);

module.exports = router;
