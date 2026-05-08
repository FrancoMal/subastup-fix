/**
 * Middleware global de manejo de errores.
 * Se usa al final de app.js.
 * 
 * Para usarlo desde un controller:
 *   next(new Error('mensaje'))  → 500
 *   const err = new Error('No encontrado'); err.status = 404; next(err)
 */
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  // En desarrollo mostramos el stack, en producción no
  const response = {
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  console.error(`[ERROR ${status}] ${req.method} ${req.path} → ${message}`);
  res.status(status).json(response);
};

module.exports = { errorHandler };
