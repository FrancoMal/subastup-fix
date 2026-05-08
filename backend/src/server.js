require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   SubastUP API                       ║
  ║   http://localhost:${PORT}           ║
  ║   Entorno: ${process.env.NODE_ENV}   ║
  ╚══════════════════════════════════════╝
  `);
});
