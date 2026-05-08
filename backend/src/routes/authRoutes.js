const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

// POST /auth/register
router.post('/register', authController.register);

// POST /auth/login
router.post('/login', authController.login);

// POST /auth/logout  (requiere token)
router.post('/logout', authMiddleware, authController.logout);

// POST /auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// POST /auth/verify-code
router.post('/verify-code', authController.verifyCode);

// POST /auth/reset-password
router.post('/reset-password', authController.resetPassword);

module.exports = router;
