// controllers/authController.js
// Autenticación completa con Prisma + PostgreSQL

require('dotenv').config();
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const prisma     = require('../config/prisma');

const { enviarResetPassword } = require('../services/mailService');

// ── Helpers ───────────────────────────────────────────────────
const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const codeExpiryMs = () =>
  parseInt(process.env.VERIFY_CODE_EXPIRY_MINUTES || '15') * 60 * 1000;

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ ok: false, message: 'Email y contraseña son requeridos.' });

    // Buscar registro con persona y login incluidos
    const registro = await prisma.registros.findFirst({
      where: { email: email.toLowerCase().trim() },
      include: {
        personas: true,
        logins:   true,
      },
    });

    if (!registro)
      return res.status(401).json({ ok: false, message: 'Email o contraseña incorrectos.' });

    // Verificar estado de la cuenta
    if (registro.estado !== 'aprobado') {
      let message;
      if (registro.estado === 'pendiente')
        message = 'Tu cuenta aún no fue aprobada por un administrador.';
      else if (registro.estado === 'rechazado')
        message = `Tu cuenta fue rechazada. Motivo: ${registro.motivoRechazo || 'Sin especificar'}`;
      else if (registro.estado === 'en pausa')
        message = 'Tu cuenta está suspendida. Contactá al soporte.';
      else
        message = 'Tu cuenta no está habilitada.';
      return res.status(403).json({ ok: false, message, estado: registro.estado });
    }

    const login = registro.logins;
    if (!login)
      return res.status(401).json({ ok: false, message: 'Email o contraseña incorrectos.' });

    // Verificar bloqueo
    if (login.bloqueado)
      return res.status(403).json({ ok: false, message: 'Cuenta bloqueada por múltiples intentos fallidos.' });

    // Verificar contraseña
    const passwordOk = await bcrypt.compare(password, login.passwordHash);

    if (!passwordOk) {
      // Incrementar intentos fallidos
      const nuevosIntentos = login.intentosFallidos + 1;
      await prisma.logins.update({
        where: { registro: registro.identificador },
        data: {
          intentosFallidos: nuevosIntentos,
          bloqueado:        nuevosIntentos >= 5,
        },
      });
      return res.status(401).json({ ok: false, message: 'Email o contraseña incorrectos.' });
    }

    // Resetear intentos y actualizar último acceso
    await prisma.logins.update({
      where: { registro: registro.identificador },
      data: {
        intentosFallidos: 0,
        bloqueado:        false,
        ultimoAcceso:     new Date(),
      },
    });

    // Generar JWT
    const token = jwt.sign(
      {
        registroId: registro.identificador,
        personaId:  registro.personas.identificador,
        email:      registro.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      ok: true,
      token,
      usuario: {
        registroId: registro.identificador,
        nombre:     registro.personas.nombre,
        documento:  registro.personas.documento,
        email:      registro.email,
      },
    });

  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const {
      nombre, apellido, dni, telefono, email, password,
      direccion, numero, pais, ciudad, codigoPostal,
      foto1Base64, foto2Base64,
    } = req.body;

    if (!nombre || !apellido || !dni || !email || !password)
      return res.status(400).json({ ok: false, message: 'Faltan campos obligatorios.' });

    // Verificar email duplicado
    const existe = await prisma.registros.findFirst({
      where: { email: email.toLowerCase().trim() },
    });
    if (existe)
      return res.status(409).json({ ok: false, message: 'Ya existe una cuenta con ese email.' });

    // Hash de contraseña
    const salt         = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Dirección completa
    const direccionCompleta = [direccion, numero, ciudad, pais, codigoPostal]
      .filter(Boolean)
      .join(', ');

    // Transacción: crear persona + registro + login + fotos
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Persona
      const persona = await tx.personas.create({
        data: {
          documento: dni.trim(),
          nombre:    `${nombre.trim()} ${apellido.trim()}`,
          direccion: direccionCompleta || null,
          estado:    'activo',
          foto:      foto1Base64 ? Buffer.from(foto1Base64, 'base64') : null,
        },
      });

      // 2. Registro
      const registro = await tx.registros.create({
        data: {
          persona:  persona.identificador,
          email:    email.toLowerCase().trim(),
          telefono: telefono?.trim() || null,
          estado:   'pendiente',
        },
      });

      // 3. Login
      await tx.logins.create({
        data: {
          registro:     registro.identificador,
          passwordHash,
          salt,
          intentosFallidos: 0,
          bloqueado:        false,
        },
      });

      // 4. Fotos DNI
      if (foto1Base64) {
        await tx.fotosDNI.create({
          data: {
            registro: registro.identificador,
            tipo:     'frente',
            foto:     Buffer.from(foto1Base64, 'base64'),
          },
        });
      }
      if (foto2Base64) {
        await tx.fotosDNI.create({
          data: {
            registro: registro.identificador,
            tipo:     'dorso',
            foto:     Buffer.from(foto2Base64, 'base64'),
          },
        });
      }

      return { registroId: registro.identificador };
    });

    return res.status(201).json({
      ok:         true,
      message:    'Registro recibido. Un administrador revisará tus datos.',
      registroId: resultado.registroId,
    });

  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ ok: false, message: 'El email es requerido.' });

    const registro = await prisma.registros.findFirst({
      where: { email: email.toLowerCase().trim() },
    });

    // Respuesta genérica por seguridad
    if (!registro)
      return res.json({ ok: true, message: 'Si el mail existe, recibirás el código.' });

    if (registro.tokenVerif) {
      const parts = registro.tokenVerif.split(':');
      if (parts[0] === 'RESET' && Date.now() - parseInt(parts[2]) < codeExpiryMs()) {
        await enviarResetPassword(registro.email, parts[1]);
        return res.json({ ok: true, message: 'Si el mail existe, recibirás el código.' });
      }
    }

    const codigo    = generateCode();
    const timestamp = Date.now();
    const tokenVerif = `RESET:${codigo}:${timestamp}`;

    await prisma.registros.update({
      where: { identificador: registro.identificador },
      data:  { tokenVerif },
    });

    await enviarResetPassword(registro.email, codigo);

    console.log(`🔑  Código de reset (dev): ${codigo}`);

    return res.json({ ok: true, message: 'Si el mail existe, recibirás el código.' });

  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/verify-code
// ─────────────────────────────────────────────────────────────
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code)
      return res.status(400).json({ ok: false, message: 'Email y código son requeridos.' });

    const registro = await prisma.registros.findFirst({
      where: { email: email.toLowerCase().trim() },
    });

    if (!registro || !registro.tokenVerif)
      return res.status(400).json({ ok: false, message: 'Código inválido o expirado.' });

    const [prefix, storedCode, timestamp] = registro.tokenVerif.split(':');

    if (prefix !== 'RESET' || storedCode !== code.trim())
      return res.status(400).json({ ok: false, message: 'El código ingresado no es correcto.' });

    if (Date.now() - parseInt(timestamp) > codeExpiryMs())
      return res.status(400).json({ ok: false, message: 'El código expiró. Solicitá uno nuevo.' });

    // Generar resetToken (JWT de un solo uso, 10 min)
    const resetToken = jwt.sign(
      { registroId: registro.identificador, email: registro.email, type: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    // Limpiar el token del registro
    await prisma.registros.update({
      where: { identificador: registro.identificador },
      data:  { tokenVerif: null },
    });

    return res.json({ ok: true, resetToken });

  } catch (err) {
    console.error('verifyCode error:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword)
      return res.status(400).json({ ok: false, message: 'Todos los campos son requeridos.' });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ ok: false, message: 'Las contraseñas no coinciden.' });

    if (newPassword.length < 6)
      return res.status(400).json({ ok: false, message: 'La contraseña debe tener al menos 6 caracteres.' });

    // Verificar resetToken
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ ok: false, message: 'Token inválido o expirado.' });
    }

    if (decoded.type !== 'reset')
      return res.status(400).json({ ok: false, message: 'Token inválido.' });

    // Nuevo hash
    const salt         = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.logins.update({
      where: { registro: decoded.registroId },
      data: {
        passwordHash,
        salt,
        intentosFallidos: 0,
        bloqueado:        false,
      },
    });

    return res.json({ ok: true, message: 'Contraseña actualizada correctamente.' });

  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/validate-user  (ruta protegida — solo admin)
// ─────────────────────────────────────────────────────────────
exports.validateUser = async (req, res) => {
  try {
    const { registroId, aprobar, motivoRechazo } = req.body;

    if (!registroId)
      return res.status(400).json({ ok: false, message: 'registroId es requerido.' });

    const nuevoEstado = aprobar ? 'aprobado' : 'rechazado';

    await prisma.registros.update({
      where: { identificador: parseInt(registroId) },
      data: {
        estado:        nuevoEstado,
        motivoRechazo: aprobar ? null : (motivoRechazo || 'Sin motivo especificado'),
      },
    });

    return res.json({
      ok:      true,
      message: `Usuario ${nuevoEstado} correctamente.`,
      estado:  nuevoEstado,
    });

  } catch (err) {
    console.error('validateUser error:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
  }
};
