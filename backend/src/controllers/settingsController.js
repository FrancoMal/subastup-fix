const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /settings
const getSettings = async (req, res, next) => {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: req.user.id }
    });
    res.json(settings);
  } catch (err) { next(err); }
};

// PUT /settings
const updateSettings = async (req, res, next) => {
  try {
    const { theme, preferredCurrency, notificationsEnabled } = req.body;
    const updated = await prisma.userSettings.update({
      where: { userId: req.user.id },
      data: { theme, preferredCurrency, notificationsEnabled },
    });
    res.json(updated);
  } catch (err) { next(err); }
};

// GET /settings/payment-methods
const getPaymentMethods = async (req, res, next) => {
  try {
    const methods = await prisma.paymentMethod.findMany({
      where: { userId: req.user.id }
    });
    res.json(methods);
  } catch (err) { next(err); }
};

// POST /settings/payment-methods
const addPaymentMethod = async (req, res, next) => {
  try {
    const { type, label, isDefault } = req.body;

    // Si es el nuevo default, quitar el default anterior
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      });
    }

    const method = await prisma.paymentMethod.create({
      data: { userId: req.user.id, type, label, isDefault: isDefault || false }
    });

    res.status(201).json(method);
  } catch (err) { next(err); }
};

// DELETE /settings/payment-methods/:id
const deletePaymentMethod = async (req, res, next) => {
  try {
    const method = await prisma.paymentMethod.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!method) return res.status(404).json({ error: 'Método de pago no encontrado.' });
    if (method.userId !== req.user.id) return res.status(401).json({ error: 'No autenticado.' });

    await prisma.paymentMethod.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getSettings, updateSettings, getPaymentMethods, addPaymentMethod, deletePaymentMethod };
