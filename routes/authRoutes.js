const express = require('express');
const { register, login, refreshToken, logout } = require('../controllers/authController');
const { validateLogin, validateRefreshToken } = require('../middleware/validator');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', validateRefreshToken, refreshToken);

// Protected routes
router.post('/logout', protect, logout);

module.exports = router;
