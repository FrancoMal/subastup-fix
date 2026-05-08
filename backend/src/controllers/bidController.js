const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /bids
const placeBid = async (req, res, next) => {
  try {
    const { auctionId, amount } = req.body;

    const auction = await prisma.auction.findUnique({
      where: { id: Number(auctionId) },
      include: { bids: { orderBy: { amount: 'desc' }, take: 1 } }
    });

    if (!auction)                         return res.status(404).json({ error: 'Subasta no encontrada.' });
    if (auction.status !== 'ACTIVE')      return res.status(400).json({ error: 'La subasta no está activa.' });
    if (auction.sellerId === req.user.id) return res.status(403).json({ error: 'El vendedor no puede pujar en su propia subasta.' });

    const topBid = auction.bids[0];
    if (topBid && topBid.bidderId === req.user.id) {
      return res.status(409).json({ error: 'Ya tenés la puja más alta.' });
    }
    if (Number(amount) <= auction.currentPrice) {
      return res.status(400).json({ error: `La puja debe superar el precio actual de ${auction.currentPrice}.` });
    }

    // Crear la puja y actualizar el precio actual en una transacción
    const [bid] = await prisma.$transaction([
      prisma.bid.create({
        data: {
          auctionId: Number(auctionId),
          bidderId: req.user.id,
          amount: Number(amount),
          currency: auction.currency,
        }
      }),
      prisma.auction.update({
        where: { id: Number(auctionId) },
        data: { currentPrice: Number(amount) }
      }),
    ]);

    res.status(201).json(bid);
  } catch (err) { next(err); }
};

module.exports = { placeBid };
