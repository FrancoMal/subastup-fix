const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /notifications
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (err) { next(err); }
};

// PATCH /notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!notification) return res.status(404).json({ error: 'Notificación no encontrada.' });
    if (notification.userId !== req.user.id) return res.status(403).json({ error: 'Sin permisos.' });

    const updated = await prisma.notification.update({
      where: { id: Number(req.params.id) },
      data: { read: true }
    });

    res.json(updated);
  } catch (err) { next(err); }
};

module.exports = { getNotifications, markAsRead };
