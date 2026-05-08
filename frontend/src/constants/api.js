// ─────────────────────────────────────────────────────────────
// Cambiá BASE_URL según el entorno:
//
//  Desarrollo local:
//    → Si corrés el backend en tu PC y probás con Expo Go en el
//      celular, tenés que usar la IP local de tu máquina, NO localhost.
//      Ejemplo: 'http://192.168.1.100:3000'
//
//  Producción (Railway):
//    → 'https://tu-app.railway.app'
// ─────────────────────────────────────────────────────────────
export const BASE_URL = 'http://192.168.1.100:3000'; // ← cambiá esto

export const ENDPOINTS = {
  // Auth
  REGISTER:        '/auth/register',
  LOGIN:           '/auth/login',
  LOGOUT:          '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  VERIFY_CODE:     '/auth/verify-code',
  RESET_PASSWORD:  '/auth/reset-password',

  // Usuarios
  ME:              '/users/me',
  MY_BIDS:         '/users/me/bids',
  MY_AUCTIONS:     '/users/me/auctions',

  // Subastas
  AUCTIONS:        '/auctions',
  AUCTION_BY_ID:   (id) => `/auctions/${id}`,
  UPLOAD_IMAGES:   '/auctions/upload-images',
  SUGGESTIONS:     '/auctions/search/suggestions',
  AUCTION_STATUS:  (id) => `/auctions/${id}/status`,
  SHARE_LINK:      (id) => `/auctions/${id}/share-link`,
  CALENDAR:        '/auctions/calendar',

  // Pujas
  BIDS:            '/bids',

  // Chats
  CHATS:           '/chats',
  MESSAGES:        (chatId) => `/chats/${chatId}/messages`,

  // Notificaciones
  NOTIFICATIONS:   '/notifications',
  MARK_READ:       (id) => `/notifications/${id}/read`,

  // Configuración
  SETTINGS:        '/settings',
  PAYMENT_METHODS: '/settings/payment-methods',
  PAYMENT_BY_ID:   (id) => `/settings/payment-methods/${id}`,

  // Ayuda
  FAQ:             '/help/faq',
};
