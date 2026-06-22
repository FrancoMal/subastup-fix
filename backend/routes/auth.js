// routes/auth.js
// Rutas de autenticación

const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const {
  login,
  register,
  forgotPassword,
  verifyCode,
  resetPassword,
  validateUser,
  logout,
} = require('../controllers/authController');

// ── Públicas ──────────────────────────────────────────────────
router.post('/login',           login);
router.post('/register',        register);
router.post('/forgot-password', forgotPassword);
router.post('/verify-code',     verifyCode);
router.post('/reset-password',  resetPassword);

// ── Protegida (solo admin) ────────────────────────────────────
// En producción agregá un middleware adicional que verifique el rol admin.
router.post('/validate-user', auth, validateUser);

// ── Protegida (usuario general) ───────────────────────────────
router.post('/logout', auth, logout);

module.exports = router;
