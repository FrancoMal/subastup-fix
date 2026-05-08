const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─────────────────────────────────────────
// POST /auth/register
// ─────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const {
      name, lastName, dni, phone, email, password,
      avatarUrl, address, addressNumber, country, city, postalCode
    } = req.body;

    // Validaciones básicas
    if (!name || !lastName || !dni || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    // Verificar que no exista el email o DNI
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { dni }] }
    });
    if (existingUser) {
      return res.status(409).json({ error: 'El email o DNI ya está registrado.' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name, lastName, dni, phone, email,
        password: hashedPassword,
        avatarUrl, address, addressNumber, country, city, postalCode,
        // Crear configuración por defecto automáticamente
        settings: {
          create: {
            theme: 'LIGHT',
            preferredCurrency: 'ARS',
            notificationsEnabled: true,
          }
        }
      }
    });

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      token,
      userId: user.id,
      name: user.name,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /auth/login
// ─────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      userId: user.id,
      name: user.name,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /auth/logout
// ─────────────────────────────────────────
const logout = async (req, res) => {
  // Con JWT stateless, el cliente simplemente borra el token.
  // Acá podrías agregar una blacklist en Redis si lo necesitás.
  res.json({ message: 'Sesión cerrada.' });
};

// ─────────────────────────────────────────
// POST /auth/forgot-password
// ─────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Email no registrado.' });
    }

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await prisma.user.update({
      where: { email },
      data: { resetCode: code, resetCodeExpires: expires }
    });

    // TODO: Enviar email con el código (nodemailer / SendGrid)
    // Por ahora lo devolvemos en la respuesta para desarrollo
    console.log(`[DEV] Código de recuperación para ${email}: ${code}`);

    res.json({ message: 'Código enviado al email.', ...(process.env.NODE_ENV === 'development' && { code }) });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /auth/verify-code
// ─────────────────────────────────────────
const verifyCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.resetCode !== code || user.resetCodeExpires < new Date()) {
      return res.status(400).json({ error: 'Código inválido o expirado.' });
    }

    res.json({ message: 'Código válido.' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /auth/reset-password
// ─────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.resetCode !== code || user.resetCodeExpires < new Date()) {
      return res.status(400).json({ error: 'Código inválido o expirado.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, resetCode: null, resetCodeExpires: null }
    });

    res.json({ message: 'Contraseña actualizada.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, forgotPassword, verifyCode, resetPassword };
