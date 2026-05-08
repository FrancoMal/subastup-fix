// Paleta de colores de SubastUP
// Extraída del logo: rojo oscuro, blanco y negro

export const COLORS = {
  // ── Primarios ──────────────────────────────
  primary:        '#B71C1C',   // Rojo oscuro del logo
  primaryLight:   '#E53935',   // Rojo más claro para hover/press
  primaryDark:    '#7F0000',   // Rojo muy oscuro para sombras

  // ── Secundarios ────────────────────────────
  secondary:      '#212121',   // Negro casi puro (texto principal)
  secondaryLight: '#424242',   // Gris oscuro (texto secundario)

  // ── Neutros ────────────────────────────────
  white:          '#FFFFFF',
  background:     '#F5F5F5',   // Fondo gris muy claro
  surface:        '#FFFFFF',   // Fondo de cards
  border:         '#E0E0E0',   // Bordes y separadores
  placeholder:    '#9E9E9E',   // Texto de placeholder

  // ── Estados ────────────────────────────────
  success:        '#2E7D32',   // Verde para pujas exitosas
  warning:        '#F57F17',   // Amarillo para subastas por terminar
  error:          '#C62828',   // Rojo para errores
  info:           '#1565C0',   // Azul para información

  // ── Específicos de la app ──────────────────
  badgeRed:       '#B71C1C',   // Badge de notificaciones
  timerWarning:   '#FF6F00',   // Contador cuando queda poco tiempo
  bidGreen:       '#1B5E20',   // Color de la puja ganadora
};

// Tipografías
export const FONTS = {
  regular:  'System',
  medium:   'System',
  bold:     'System',
  sizes: {
    xs:   11,
    sm:   13,
    md:   15,
    lg:   17,
    xl:   20,
    xxl:  24,
    hero: 32,
  }
};

// Espaciados
export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// Bordes redondeados
export const RADIUS = {
  sm:   4,
  md:   8,
  lg:   12,
  xl:   20,
  full: 999,
};
