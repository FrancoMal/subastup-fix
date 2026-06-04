// controllers/authController.js
// Lógica de negocio para autenticación y registro

const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { getPool, sql } = require('../config/db');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Genera un código numérico de N dígitos */
function generarCodigo(digitos = 6) {
  const min = Math.pow(10, digitos - 1);
  const max = Math.pow(10, digitos) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

/** Configura el transporter de nodemailer usando las variables de entorno */
function crearTransporter() {
  return nodemailer.createTransport({
    host:   process.env.MAIL_HOST,
    port:   parseInt(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Body: { email, password }
 *
 * Flujo:
 *  1. Busca el registro por email.
 *  2. Verifica que el usuario esté validado (validado = 1).
 *  3. Verifica que la cuenta no esté bloqueada.
 *  4. Compara la contraseña con el hash.
 *  5. Incrementa intentos fallidos si la contraseña es incorrecta.
 *  6. Resetea intentos y registra ultimoAcceso si es correcta.
 *  7. Devuelve JWT.
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Email y contraseña son requeridos.' });
  }

  try {
    const pool = await getPool();

    // Traer registro + login + persona
    const result = await pool.request()
      .input('email', sql.VarChar(200), email.trim().toLowerCase())
      .query(`
        SELECT
          r.identificador  AS registroId,
          r.validado,
          r.motivoRechazo,
          p.identificador  AS personaId,
          p.nombre,
          p.documento,
          p.estado         AS estadoPersona,
          l.identificador  AS loginId,
          l.passwordHash,
          l.salt,
          l.intentosFallidos,
          l.bloqueado,
          l.ultimoAcceso
        FROM registros r
        INNER JOIN personas  p ON p.identificador = r.persona
        INNER JOIN logins    l ON l.registro      = r.identificador
        WHERE r.email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ ok: false, message: 'Email o contraseña incorrectos.' });
    }

    const user = result.recordset[0];

    // ── Verificación de validado (aprobado por admin) ──────────────────────
    if (!user.validado) {
      const mensaje = user.motivoRechazo
        ? `Tu cuenta fue rechazada: ${user.motivoRechazo}`
        : 'Tu cuenta aún no fue aprobada por un administrador. Revisá tu correo.';
      return res.status(403).json({ ok: false, message: mensaje, pendiente: true });
    }

    // ── Persona activa ─────────────────────────────────────────────────────
    if (user.estadoPersona !== 'activo') {
      return res.status(403).json({ ok: false, message: 'Tu cuenta está deshabilitada.' });
    }

    // ── Cuenta bloqueada por intentos ─────────────────────────────────────
    if (user.bloqueado) {
      return res.status(403).json({
        ok: false,
        message: 'Tu cuenta está bloqueada por demasiados intentos fallidos. Contactá al soporte.',
      });
    }

    // ── Verificar contraseña ───────────────────────────────────────────────
    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
      const nuevoIntentos = user.intentosFallidos + 1;
      const bloquear = nuevoIntentos >= 5; // bloquear al 5to intento fallido

      await pool.request()
        .input('loginId',   sql.Int, user.loginId)
        .input('intentos',  sql.Int, nuevoIntentos)
        .input('bloqueado', sql.Bit, bloquear ? 1 : 0)
        .query(`
          UPDATE logins
          SET intentosFallidos = @intentos,
              bloqueado        = @bloqueado
          WHERE identificador  = @loginId
        `);

      if (bloquear) {
        return res.status(403).json({
          ok: false,
          message: 'Cuenta bloqueada por demasiados intentos. Contactá al soporte.',
        });
      }

      return res.status(401).json({ ok: false, message: 'Email o contraseña incorrectos.' });
    }

    // ── Login exitoso: resetear intentos y registrar acceso ───────────────
    await pool.request()
      .input('loginId', sql.Int, user.loginId)
      .query(`
        UPDATE logins
        SET intentosFallidos = 0,
            bloqueado        = 0,
            ultimoAcceso     = GETDATE()
        WHERE identificador  = @loginId
      `);

    // ── Generar JWT ────────────────────────────────────────────────────────
    const token = jwt.sign(
      {
        registroId: user.registroId,
        personaId:  user.personaId,
        email:      email.trim().toLowerCase(),
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      ok: true,
      message: 'Login exitoso.',
      token,
      usuario: {
        nombre:     user.nombre,
        documento:  user.documento,
        email:      email.trim().toLowerCase(),
        registroId: user.registroId,
      },
    });

  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
  }
};

// ─── REGISTRO ─────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: {
 *   nombre, apellido, dni, telefono, email, password,
 *   direccion, numero, ciudad, codigoPostal, pais,
 *   foto1Base64?, foto2Base64?
 * }
 *
 * Flujo:
 *  1. Verifica que el email no exista.
 *  2. Verifica que el DNI no exista.
 *  3. Inserta persona (estado = 'activo').
 *  4. Inserta en registros (validado = 0 → pendiente de aprobación admin).
 *  5. Hashea la contraseña e inserta en logins.
 *  6. Si hay fotos, las guarda en la tabla fotos (requiere un producto asociado, aquí las guarda en personas.foto como primera foto).
 *  7. Devuelve mensaje de éxito.
 */
exports.register = async (req, res) => {
  const {
    nombre, apellido, dni, telefono, email, password,
    direccion, numero, ciudad, codigoPostal, pais,
    foto1Base64, foto2Base64,
  } = req.body;

  // Validaciones básicas
  if (!nombre || !apellido || !dni || !email || !password) {
    return res.status(400).json({ ok: false, message: 'Faltan datos obligatorios.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, message: 'El formato del email no es válido.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ ok: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    const pool = await getPool();

    // ── Email duplicado ────────────────────────────────────────────────────
    const emailCheck = await pool.request()
      .input('email', sql.VarChar(200), email.trim().toLowerCase())
      .query(`SELECT 1 FROM registros WHERE email = @email`);

    if (emailCheck.recordset.length > 0) {
      return res.status(409).json({ ok: false, message: 'Ya existe una cuenta con ese email.' });
    }

    // ── DNI duplicado ──────────────────────────────────────────────────────
    const dniCheck = await pool.request()
      .input('dni', sql.VarChar(20), dni.trim())
      .query(`SELECT 1 FROM personas WHERE documento = @dni`);

    if (dniCheck.recordset.length > 0) {
      return res.status(409).json({ ok: false, message: 'Ya existe una cuenta con ese DNI.' });
    }

    // ── Armar dirección completa ───────────────────────────────────────────
    const direccionCompleta = [direccion, numero, ciudad, codigoPostal, pais]
      .filter(Boolean)
      .join(', ');

    // ── Convertir foto1 a buffer si viene en base64 ────────────────────────
    let fotoBuffer = null;
    if (foto1Base64) {
      const base64Data = foto1Base64.replace(/^data:image\/\w+;base64,/, '');
      fotoBuffer = Buffer.from(base64Data, 'base64');
    }

    // ── Insertar en personas ───────────────────────────────────────────────
    const personaResult = await pool.request()
      .input('documento',  sql.VarChar(20),       dni.trim())
      .input('nombre',     sql.VarChar(150),       `${nombre.trim()} ${apellido.trim()}`)
      .input('direccion',  sql.VarChar(250),       direccionCompleta || null)
      .input('estado',     sql.VarChar(15),        'activo')
      .input('foto',       sql.VarBinary(sql.MAX), fotoBuffer)
      .query(`
        INSERT INTO personas (documento, nombre, direccion, estado, foto)
        OUTPUT INSERTED.identificador
        VALUES (@documento, @nombre, @direccion, @estado, @foto)
      `);

    const personaId = personaResult.recordset[0].identificador;

    // ── Generar token de verificación ──────────────────────────────────────
    const tokenVerif = require('crypto').randomBytes(32).toString('hex');

    // ── Insertar en registros (validado = 0 → pendiente de aprobación) ─────
    const registroResult = await pool.request()
      .input('persona',      sql.Int,         personaId)
      .input('email',        sql.VarChar(200), email.trim().toLowerCase())
      .input('tokenVerif',   sql.VarChar(200), tokenVerif)
      .query(`
        INSERT INTO registros (persona, email, tokenVerif, validado)
        OUTPUT INSERTED.identificador
        VALUES (@persona, @email, @tokenVerif, 0)
      `);

    const registroId = registroResult.recordset[0].identificador;

    // ── Hashear contraseña ─────────────────────────────────────────────────
    const salt       = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // ── Insertar en logins ─────────────────────────────────────────────────
    await pool.request()
      .input('registroId',   sql.Int,         registroId)
      .input('passwordHash', sql.VarChar(512), passwordHash)
      .input('salt',         sql.VarChar(100), salt)
      .query(`
        INSERT INTO logins (registro, passwordHash, salt)
        VALUES (@registroId, @passwordHash, @salt)
      `);

    // ── Guardar foto2 si existe (como segunda imagen en tabla fotos) ────────
    // Nota: fotos requiere un productoId; aquí las fotos de perfil se guardan
    // en personas.foto. Si se necesita foto2, extendé esta lógica.

    return res.status(201).json({
      ok: true,
      message: 'Registro enviado correctamente. Un administrador revisará tus datos.',
      registroId,
    });

  } catch (err) {
    console.error('Error en registro:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 *
 * Flujo:
 *  1. Verifica que el email exista en registros.
 *  2. Genera un código de 6 dígitos.
 *  3. Guarda el código hasheado + expiración en logins (col tokenReset / expiracionReset).
 *     Como la tabla logins no tiene esas columnas en el SQL original, las guardamos
 *     en tokenVerif de registros (con prefijo "RESET:codigo:timestamp").
 *  4. Envía el código por email.
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ ok: false, message: 'El email es requerido.' });
  }

  try {
    const pool = await getPool();

    const result = await pool.request()
      .input('email', sql.VarChar(200), email.trim().toLowerCase())
      .query(`
        SELECT r.identificador AS registroId, r.validado
        FROM registros r
        WHERE r.email = @email
      `);

    // Por seguridad, siempre respondemos OK (no revelar si el email existe)
    if (result.recordset.length === 0) {
      return res.status(200).json({
        ok: true,
        message: 'Si el email existe, recibirás un código de verificación.',
      });
    }

    const { registroId, validado } = result.recordset[0];

    // Generar código y timestamp de expiración
    const codigo    = generarCodigo(6);
    const expiresAt = Date.now() + (parseInt(process.env.VERIFY_CODE_EXPIRY_MINUTES) || 15) * 60 * 1000;
    const tokenData = `RESET:${codigo}:${expiresAt}`;

    // Guardar en tokenVerif del registro
    await pool.request()
      .input('registroId', sql.Int,         registroId)
      .input('tokenVerif', sql.VarChar(200), tokenData)
      .query(`UPDATE registros SET tokenVerif = @tokenVerif WHERE identificador = @registroId`);

    // Enviar email con el código
    try {
      const transporter = crearTransporter();
      await transporter.sendMail({
        from:    process.env.MAIL_FROM,
        to:      email.trim().toLowerCase(),
        subject: 'Código de verificación',
        html: `
          <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px;">
            <h2 style="color:#8b0000;">Recupero de contraseña</h2>
            <p>Tu código de verificación es:</p>
            <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1a1a1a;margin:16px 0;">
              ${codigo}
            </div>
            <p style="color:#888;font-size:13px;">
              Este código expira en ${process.env.VERIFY_CODE_EXPIRY_MINUTES || 15} minutos.<br/>
              Si no solicitaste este código, ignorá este email.
            </p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error('Error enviando email:', mailErr.message);
      // No interrumpir el flujo; en dev el código puede verse en logs
      console.log('🔑  Código de reset (dev):', codigo);
    }

    return res.status(200).json({
      ok: true,
      message: 'Si el email existe, recibirás un código de verificación.',
    });

  } catch (err) {
    console.error('Error en forgot-password:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
  }
};

// ─── VERIFY CODE ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/verify-code
 * Body: { email, code }
 *
 * Verifica que el código coincida y no haya expirado.
 * Devuelve un token temporal de un solo uso para el reset.
 */
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ ok: false, message: 'Email y código son requeridos.' });
  }

  try {
    const pool = await getPool();

    const result = await pool.request()
      .input('email', sql.VarChar(200), email.trim().toLowerCase())
      .query(`
        SELECT identificador AS registroId, tokenVerif
        FROM registros
        WHERE email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(400).json({ ok: false, message: 'Código inválido.' });
    }

    const { registroId, tokenVerif } = result.recordset[0];

    if (!tokenVerif || !tokenVerif.startsWith('RESET:')) {
      return res.status(400).json({ ok: false, message: 'No hay un código activo para este email.' });
    }

    const parts   = tokenVerif.split(':');
    const stored  = parts[1];
    const expiry  = parseInt(parts[2]);

    if (Date.now() > expiry) {
      return res.status(400).json({ ok: false, message: 'El código expiró. Solicitá uno nuevo.' });
    }

    if (stored !== code.trim()) {
      return res.status(400).json({ ok: false, message: 'El código ingresado no es válido.' });
    }

    // Código correcto → generar token temporal de reset (válido 10 min)
    const resetToken = jwt.sign(
      { registroId, email: email.trim().toLowerCase(), action: 'reset-password' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    return res.status(200).json({
      ok: true,
      message: 'Código verificado.',
      resetToken,
    });

  } catch (err) {
    console.error('Error en verify-code:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────

/**
 * POST /api/auth/reset-password
 * Body: { resetToken, newPassword, confirmPassword }
 *
 * Usa el token temporal para actualizar la contraseña.
 */
exports.resetPassword = async (req, res) => {
  const { resetToken, newPassword, confirmPassword } = req.body;

  if (!resetToken || !newPassword || !confirmPassword) {
    return res.status(400).json({ ok: false, message: 'Faltan datos requeridos.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ ok: false, message: 'Las contraseñas no coinciden.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ ok: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    // Verificar token temporal
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ ok: false, message: 'El token expiró o no es válido. Iniciá el proceso de nuevo.' });
    }

    if (decoded.action !== 'reset-password') {
      return res.status(400).json({ ok: false, message: 'Token no válido para esta acción.' });
    }

    const pool = await getPool();

    // Verificar que el login exista
    const loginResult = await pool.request()
      .input('registroId', sql.Int, decoded.registroId)
      .query(`SELECT identificador AS loginId FROM logins WHERE registro = @registroId`);

    if (loginResult.recordset.length === 0) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado.' });
    }

    const { loginId } = loginResult.recordset[0];

    // Hashear nueva contraseña
    const salt         = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Actualizar contraseña y desbloquear cuenta
    await pool.request()
      .input('loginId',      sql.Int,         loginId)
      .input('passwordHash', sql.VarChar(512), passwordHash)
      .input('salt',         sql.VarChar(100), salt)
      .query(`
        UPDATE logins
        SET passwordHash     = @passwordHash,
            salt             = @salt,
            intentosFallidos = 0,
            bloqueado        = 0
        WHERE identificador  = @loginId
      `);

    // Limpiar el token de reset
    await pool.request()
      .input('registroId', sql.Int, decoded.registroId)
      .query(`UPDATE registros SET tokenVerif = NULL WHERE identificador = @registroId`);

    return res.status(200).json({
      ok: true,
      message: 'Contraseña actualizada correctamente. Ya podés iniciar sesión.',
    });

  } catch (err) {
    console.error('Error en reset-password:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
  }
};

// ─── APROBAR / RECHAZAR USUARIO (Admin) ───────────────────────────────────────

/**
 * POST /api/auth/validate-user
 * Body: { registroId, aprobar: true/false, motivoRechazo? }
 *
 * Endpoint de uso interno por administradores para aprobar o rechazar
 * un registro pendiente (cambia validado = 1 o 0 con motivoRechazo).
 */
exports.validateUser = async (req, res) => {
  const { registroId, aprobar, motivoRechazo } = req.body;

  if (registroId === undefined || aprobar === undefined) {
    return res.status(400).json({ ok: false, message: 'registroId y aprobar son requeridos.' });
  }

  try {
    const pool = await getPool();

    await pool.request()
      .input('registroId',    sql.Int,         registroId)
      .input('validado',      sql.Bit,         aprobar ? 1 : 0)
      .input('motivoRechazo', sql.VarChar(300), aprobar ? null : (motivoRechazo || 'Rechazado por el administrador'))
      .query(`
        UPDATE registros
        SET validado      = @validado,
            motivoRechazo = @motivoRechazo
        WHERE identificador = @registroId
      `);

    return res.status(200).json({
      ok: true,
      message: aprobar ? 'Usuario aprobado.' : 'Usuario rechazado.',
    });

  } catch (err) {
    console.error('Error en validate-user:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
  }
};
