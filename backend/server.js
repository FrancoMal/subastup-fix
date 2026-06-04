// server.js
// Punto de entrada del backend

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const { getPool } = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globales ──────────────────────────────────────
app.use(cors());                           // Permitir requests desde la app móvil
app.use(express.json({ limit: '10mb' })); // Body parser JSON (soporta fotos en base64)
app.use(express.urlencoded({ extended: true }));

// ── Rutas ─────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true, server: 'SubastaAPI', ts: new Date() }));

// ── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ ok: false, message: 'Ruta no encontrada.' }));

// ── Error handler global ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
});

// ── Iniciar ───────────────────────────────────────────────────
(async () => {
  try {
    await getPool();                       // Verificar conexión a la BD al arrancar
    app.listen(PORT, () => {
      console.log(`🚀  Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌  No se pudo conectar a la base de datos:', err.message);
    process.exit(1);
  }
})();
