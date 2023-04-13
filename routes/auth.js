const express = require('express');
const router = express.Router();
const { loginUser, createUser } = require('../controllers/authController');

// POST /api/authenticate
// API endpoints for user authentication
router.post('/authenticate', loginUser);
module.exports = router;
