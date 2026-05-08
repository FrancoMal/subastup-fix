const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const bidController = require('../controllers/bidController');

// POST /bids
router.post('/', authMiddleware, bidController.placeBid);

module.exports = router;
