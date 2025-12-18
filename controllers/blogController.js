const BlogPost = require('../models/BlogPost');
const { generateBlogPost } = require('../services/aiService');

// Get all published blog posts
exports.getAllPosts = async (req, res) => {
    try {
        const { category, tag, search } = req.query;
        let query = { published: true };

        if (category) {
            query.category = category;
        }

        if (tag) {
            query.tags = tag;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } }
            ];
        }

        const posts = await BlogPost.find(query)
            .sort({ createdAt: -1 })
            .select('-content'); // Exclude full content in list view

        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single blog post by slug
exports.getPostBySlug = async (req, res) => {
    try {
        const post = await BlogPost.findOne({ slug: req.params.slug, published: true });
        
        if (!post) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        // Increment view count
        post.viewCount += 1;
        await post.save();

        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all posts (admin - including unpublished)
exports.getAllPostsAdmin = async (req, res) => {
    try {
        const posts = await BlogPost.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new blog post
exports.createPost = async (req, res) => {
    try {
        const post = new BlogPost(req.body);
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update blog post
exports.updatePost = async (req, res) => {
    try {
        const post = await BlogPost.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete blog post
exports.deletePost = async (req, res) => {
    try {
        const post = await BlogPost.findByIdAndDelete(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        res.json({ message: 'Blog post deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get blog categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await BlogPost.distinct('category', { published: true });
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get popular posts (most viewed)
exports.getPopularPosts = async (req, res) => {
    try {
        const posts = await BlogPost.find({ published: true })
            .sort({ viewCount: -1 })
            .limit(5)
            .select('-content');

        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Generate blog post using AI
exports.generateBlogWithAI = async (req, res) => {
    try {
        const { title, category } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required to generate blog content' });
        }

        console.log('Generating AI blog for:', title);

        const result = await generateBlogPost(title, category);

        res.json({
            success: true,
            content: result.content,
            excerpt: result.excerpt,
            tags: result.tags
        });

    } catch (err) {
        console.error('Error generating blog with AI:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to generate blog content with AI',
            error: err.message 
        });
    }
};
