// config/db.js
// Configuración y pool de conexión a SQL Server

const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  server:   process.env.DB_SERVER   || 'localhost',
  database: process.env.DB_DATABASE || 'SubastaDB',
  user:     process.env.DB_USER     || 'sa',
  password: process.env.DB_PASSWORD || '',
  port:     parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt:              false,   // true si usás Azure
    trustServerCertificate: true,  // útil en desarrollo local
    enableArithAbort:     true,
  },
  pool: {
    max:              10,
    min:              0,
    idleTimeoutMillis: 30000,
  },
};

// Pool global reutilizable
let pool = null;

/**
 * Devuelve el pool de conexiones (lo crea si no existe).
 * Llamar await getPool() antes de cualquier query.
 */
async function getPool() {
  if (!pool) {
    pool = await sql.connect(dbConfig);
    console.log('✅  Conectado a SQL Server:', process.env.DB_DATABASE);
  }
  return pool;
}

module.exports = { getPool, sql };
