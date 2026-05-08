const express = require('express');
const router = express.Router();
const helpController = require('../controllers/helpController');

// GET /help/faq
router.get('/faq', helpController.getFaq);

module.exports = router;
