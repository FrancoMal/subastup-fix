const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const auctionController = require('../controllers/auctionController');
// Para subir imágenes — configuramos multer con Cloudinary
const { upload } = require('../middlewares/uploadMiddleware');

// GET  /auctions  (con filtros opcionales: category, status, search, currency, page, size)
router.get('/', auctionController.getAuctions);

// GET  /auctions/calendar?month=&year=
router.get('/calendar', auctionController.getCalendar);

// GET  /auctions/search/suggestions?q=
router.get('/search/suggestions', auctionController.getSearchSuggestions);

// POST /auctions  (requiere auth)
router.post('/', authMiddleware, auctionController.createAuction);

// POST /auctions/upload-images  (requiere auth, multipart)
router.post('/upload-images', authMiddleware, upload.array('images', 10), auctionController.uploadImages);

// GET  /auctions/:id
router.get('/:id', auctionController.getAuctionById);

// PATCH /auctions/:id/status  (requiere auth)
router.patch('/:id/status', authMiddleware, auctionController.updateAuctionStatus);

// GET  /auctions/:id/share-link
router.get('/:id/share-link', auctionController.getShareLink);

module.exports = router;
