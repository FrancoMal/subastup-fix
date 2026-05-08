const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// GET  /users/me
router.get('/me', authMiddleware, userController.getMe);

// PUT  /users/me
router.put('/me', authMiddleware, userController.updateMe);

// GET  /users/me/bids
router.get('/me/bids', authMiddleware, userController.getMyBids);

// GET  /users/me/auctions
router.get('/me/auctions', authMiddleware, userController.getMyAuctions);

module.exports = router;
