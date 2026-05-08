const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, lastName: true, email: true,
        phone: true, dni: true, avatarUrl: true,
        address: true, addressNumber: true, city: true,
        postalCode: true, country: true, createdAt: true,
      }
    });
    res.json(user);
  } catch (err) { next(err); }
};

const updateMe = async (req, res, next) => {
  try {
    const { name, lastName, phone, address, addressNumber, city, postalCode } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, lastName, phone, address, addressNumber, city, postalCode },
      select: {
        id: true, name: true, lastName: true, email: true,
        phone: true, address: true, city: true, postalCode: true,
      }
    });
    res.json(updated);
  } catch (err) { next(err); }
};

const getMyBids = async (req, res, next) => {
  try {
    const bids = await prisma.bid.findMany({
      where: { bidderId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bids);
  } catch (err) { next(err); }
};

const getMyAuctions = async (req, res, next) => {
  try {
    const auctions = await prisma.auction.findMany({
      where: { sellerId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(auctions);
  } catch (err) { next(err); }
};

module.exports = { getMe, updateMe, getMyBids, getMyAuctions };
