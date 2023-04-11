const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const { createPost, deletePost, likePost, unlikePost, addComment, getSinglePost, getAllPosts } = require('../controllers/postController');

// POST /api/posts - endpoint for adding a new post created by the authenticated user
router.post('/posts', authenticateToken, createPost);

// DELETE /api/posts/:id - endpoint for deleting post with {id} created by the authenticated user
router.delete('/posts/:id', authenticateToken, deletePost);

// POST /api/like/:id - endpoint for liking the post with {id} by the authenticated user
router.post('/like/:id', authenticateToken, likePost);

// POST /api/unlike/:id - endpoint for unliking a post with {id} by the authenticated user
router.post('/unlike/:id', authenticateToken, unlikePost);

// POST /api/comment/:id - endpoint for adding a comment to a post with {id} by authenticated user
router.post('/comment/:id', authenticateToken, addComment);

// GET /api/posts/:id - endpoint for getting a single post with its likes and comments
router.get('/posts/:id', getSinglePost);

// GET /api/all_posts - endpoint for getting all posts created by the authenticated user
router.get('/all_posts', authenticateToken, getAllPosts);

module.exports = router;
