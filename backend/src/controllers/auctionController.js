const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /auctions
const getAuctions = async (req, res, next) => {
  try {
    const { category, status, search, currency, page = 0, size = 10 } = req.query;

    const where = {};
    if (category) where.category = category;
    if (status)   where.status = status;
    if (currency) where.currency = currency;
    if (search)   where.title = { contains: search, mode: 'insensitive' };

    const [auctions, total] = await Promise.all([
      prisma.auction.findMany({
        where,
        skip: Number(page) * Number(size),
        take: Number(size),
        orderBy: { startDate: 'asc' },
      }),
      prisma.auction.count({ where }),
    ]);

    res.json({
      content: auctions,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      currentPage: Number(page),
    });
  } catch (err) { next(err); }
};

// GET /auctions/:id
const getAuctionById = async (req, res, next) => {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        bids: { orderBy: { amount: 'desc' }, take: 1 },
        seller: { select: { id: true, name: true, avatarUrl: true } },
      }
    });
    if (!auction) return res.status(404).json({ error: 'Subasta no encontrada.' });

    const remainingSeconds = Math.max(0, Math.floor((new Date(auction.endDate) - new Date()) / 1000));
    const topBid = auction.bids[0] || null;

    res.json({ ...auction, remainingSeconds, topBid });
  } catch (err) { next(err); }
};

// POST /auctions
const createAuction = async (req, res, next) => {
  try {
    const {
      title, description, startingPrice, currency,
      category, startDate, endDate, includedItems, imageUrls
    } = req.body;

    const auction = await prisma.auction.create({
      data: {
        title,
        description,
        startingPrice: Number(startingPrice),
        currentPrice: Number(startingPrice),
        currency: currency || 'ARS',
        category,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        includedItems: includedItems || [],
        imageUrls: imageUrls || [],
        sellerId: req.user.id,
        status: 'PENDING',
      }
    });

    res.status(201).json(auction);
  } catch (err) { next(err); }
};

// POST /auctions/upload-images
const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se enviaron imágenes.' });
    }
    const imageUrls = req.files.map(f => f.path); // Cloudinary devuelve la URL en .path
    res.json({ imageUrls });
  } catch (err) { next(err); }
};

// GET /auctions/search/suggestions
const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const auctions = await prisma.auction.findMany({
      where: { title: { contains: q, mode: 'insensitive' } },
      select: { title: true },
      take: 8,
      distinct: ['title'],
    });

    res.json(auctions.map(a => a.title));
  } catch (err) { next(err); }
};

// PATCH /auctions/:id/status
const updateAuctionStatus = async (req, res, next) => {
  try {
    const { action, reason } = req.body;
    const auction = await prisma.auction.findUnique({ where: { id: Number(req.params.id) } });

    if (!auction) return res.status(404).json({ error: 'Subasta no encontrada.' });
    if (auction.sellerId !== req.user.id) return res.status(403).json({ error: 'Sin permisos.' });
    if (auction.status !== 'PENDING') return res.status(400).json({ error: 'Solo se puede cambiar subastas en estado PENDING.' });

    const newStatus = action === 'ACCEPT' ? 'ACTIVE' : 'CANCELLED';
    const updated = await prisma.auction.update({
      where: { id: Number(req.params.id) },
      data: { status: newStatus },
    });

    res.json(updated);
  } catch (err) { next(err); }
};

// GET /auctions/:id/share-link
const getShareLink = async (req, res, next) => {
  try {
    const auction = await prisma.auction.findUnique({ where: { id: Number(req.params.id) } });
    if (!auction) return res.status(404).json({ error: 'Subasta no encontrada.' });

    res.json({ shareUrl: `https://subastaup.com/live/${req.params.id}` });
  } catch (err) { next(err); }
};

// GET /auctions/calendar?month=&year=
const getCalendar = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23, 59, 59);

    const auctions = await prisma.auction.findMany({
      where: { startDate: { gte: start, lte: end } },
    });

    const now = new Date();
    res.json({
      month: Number(month),
      year: Number(year),
      activeNow: auctions.filter(a => a.status === 'ACTIVE'),
      scheduled: auctions.filter(a => a.status === 'PENDING' && a.startDate > now),
    });
  } catch (err) { next(err); }
};

module.exports = {
  getAuctions, getAuctionById, createAuction, uploadImages,
  getSearchSuggestions, updateAuctionStatus, getShareLink, getCalendar,
};
