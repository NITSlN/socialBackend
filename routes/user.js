const express = require('express');
const router = express.Router();

// POST /api/follow/:id
router.post('/follow/:id', (req, res) => {
  // Handle follow user logic here
});

// POST /api/unfollow/:id
router.post('/unfollow/:id', (req, res) => {
  // Handle unfollow user logic here
});

// GET /api/user - gets user profile after authenticating
router.get('/user', (req, res) => {
  // Handle user profile retrieval logic here
});

module.exports = router;
