const express = require('express')
const {
  followUser,
  unfollowUser,
  getUserProfile,
} = require('../controllers/userController')
const {authenticateToken} = require('../middlewares/authMiddleware')
const router = express.Router()

// POST /api/follow/:id - follow user with the given id
router.post('/follow/:id', authenticateToken, followUser)

// POST /api/unfollow/:id - unfollow user with the given id
router.post('/unfollow/:id', authenticateToken, unfollowUser)

// GET /api/user - gets user profile after authenticating
router.get('/user', authenticateToken, getUserProfile)

module.exports = router
