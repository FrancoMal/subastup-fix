const transporter = require('../config/mailer');

const enviarVerificacion = async (email, token) => {
  await transporter.sendMail({
    from: '"Mi App" <noreply@miapp.com>',
    to: email,
    subject: 'Verificá tu cuenta',
    html: `<p>Tu código de verificación es: <strong>${token}</strong></p>`
  });
};

const enviarResetPassword = async (email, codigo) => {
  await transporter.sendMail({
    from: '"Mi App" <noreply@miapp.com>',
    to: email,
    subject: 'Recuperación de contraseña',
    html: `<p>Tu código para resetear tu contraseña es: <strong>${codigo}</strong></p>`
  });
};

module.exports = { enviarVerificacion, enviarResetPassword };