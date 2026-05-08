const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /chats
const getChats = async (req, res, next) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        participants: { some: { userId: req.user.id } }
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      }
    });

    const response = chats.map(chat => {
      const otherParticipant = chat.participants.find(p => p.userId !== req.user.id);
      const lastMessage = chat.messages[0];
      return {
        chatId: chat.id,
        otherUserName:   otherParticipant?.user?.name || 'Usuario',
        otherUserAvatar: otherParticipant?.user?.avatarUrl || null,
        lastMessage:     lastMessage?.text || null,
        lastMessageAt:   lastMessage?.createdAt || chat.createdAt,
        unreadCount: 0, // TODO: implementar conteo de no leídos
      };
    });

    res.json(response);
  } catch (err) { next(err); }
};

// GET /chats/:chatId/messages
const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { page = 0 } = req.query;

    // Verificar que el usuario pertenece al chat
    const participant = await prisma.chatParticipant.findUnique({
      where: { userId_chatId: { userId: req.user.id, chatId: Number(chatId) } }
    });
    if (!participant) return res.status(403).json({ error: 'Sin acceso a este chat.' });

    const messages = await prisma.message.findMany({
      where: { chatId: Number(chatId) },
      orderBy: { createdAt: 'asc' },
      skip: Number(page) * 30,
      take: 30,
    });

    res.json(messages);
  } catch (err) { next(err); }
};

// POST /chats/:chatId/messages
const sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const attachment = req.file || null;

    if (!text && !attachment) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    const chat = await prisma.chat.findUnique({ where: { id: Number(chatId) } });
    if (!chat) return res.status(404).json({ error: 'Chat no encontrado.' });

    const message = await prisma.message.create({
      data: {
        chatId: Number(chatId),
        senderId: req.user.id,
        text: text || null,
        attachmentUrl:  attachment ? attachment.path : null,
        attachmentType: attachment ? 'IMAGE' : null,
      }
    });

    res.status(201).json(message);
  } catch (err) { next(err); }
};

module.exports = { getChats, getMessages, sendMessage };
