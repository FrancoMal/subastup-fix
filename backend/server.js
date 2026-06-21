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

app.use('/api/auth',           require('./routes/auth'));
app.use('/api/subastas',       require('./routes/subastas'));
app.use('/api/pujas',          require('./routes/pujas'));
app.use('/api/productos',      require('./routes/productos'));
app.use('/api/pagos',          require('./routes/pagos'));
app.use('/api/perfil',         require('./routes/perfil'));
app.use('/api/estadisticas',   require('./routes/estadisticas'));
app.use('/api/chat',           require('./routes/chat'));
app.use('/api/notificaciones', require('./routes/notificaciones'));

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
