const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/errorHandler');

// ── Rutas ──────────────────────────────────────────
const authRoutes         = require('./routes/authRoutes');
const userRoutes         = require('./routes/userRoutes');
const auctionRoutes      = require('./routes/auctionRoutes');
const bidRoutes          = require('./routes/bidRoutes');
const chatRoutes         = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes     = require('./routes/settingsRoutes');
const helpRoutes         = require('./routes/helpRoutes');

const app = express();

// ── Middlewares globales ───────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ───────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'SubastUP API corriendo 🚀' });
});

// ── Montaje de rutas ───────────────────────────────
app.use('/auth',          authRoutes);
app.use('/users',         userRoutes);
app.use('/auctions',      auctionRoutes);
app.use('/bids',          bidRoutes);
app.use('/chats',         chatRoutes);
app.use('/notifications', notificationRoutes);
app.use('/settings',      settingsRoutes);
app.use('/help',          helpRoutes);

// ── Manejo global de errores (siempre al final) ────
app.use(errorHandler);

module.exports = app;
