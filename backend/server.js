// server.js
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const prisma  = require('./config/prisma');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));

app.get('/health', (_req, res) => res.json({ ok: true, server: 'SubastaAPI', ts: new Date() }));

app.use((_req, res) => res.status(404).json({ ok: false, message: 'Ruta no encontrada.' }));

app.use((err, _req, res, _next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
});

(async () => {
  try {
    await prisma.$connect();
    console.log('✅  Conectado a PostgreSQL: subastup');
    app.listen(PORT, () => {
      console.log(`🚀  Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌  No se pudo conectar a la base de datos:', err.message);
    process.exit(1);
  }
})();
