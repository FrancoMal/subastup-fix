const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

// GET   /notifications
router.get('/', authMiddleware, notificationController.getNotifications);

// PATCH /notifications/:id/read
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

module.exports = router;
