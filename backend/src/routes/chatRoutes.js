const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const chatController = require('../controllers/chatController');
const { upload } = require('../middlewares/uploadMiddleware');

// GET  /chats
router.get('/', authMiddleware, chatController.getChats);

// GET  /chats/:chatId/messages
router.get('/:chatId/messages', authMiddleware, chatController.getMessages);

// POST /chats/:chatId/messages  (puede tener adjunto)
router.post('/:chatId/messages', authMiddleware, upload.single('attachment'), chatController.sendMessage);

module.exports = router;
