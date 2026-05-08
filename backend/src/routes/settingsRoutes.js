const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const settingsController = require('../controllers/settingsController');

// GET  /settings
router.get('/', authMiddleware, settingsController.getSettings);

// PUT  /settings
router.put('/', authMiddleware, settingsController.updateSettings);

// GET  /settings/payment-methods
router.get('/payment-methods', authMiddleware, settingsController.getPaymentMethods);

// POST /settings/payment-methods
router.post('/payment-methods', authMiddleware, settingsController.addPaymentMethod);

// DELETE /settings/payment-methods/:id
router.delete('/payment-methods/:id', authMiddleware, settingsController.deletePaymentMethod);

module.exports = router;
