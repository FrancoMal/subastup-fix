// ── URL base del backend ──────────────────────────────────────────────────────
// Android emulador:   'http://10.0.2.2:3000'
// Dispositivo físico: IP de la PC en la red WiFi local (ej: 'http://192.168.1.X:3000')
export const BASE_URL = 'http://192.168.1.100:3000';

export const ENDPOINTS = {
  // ── Auth (prefijo /api/auth montado en backend/server.js) ──────────────────
  LOGIN:           '/api/auth/login',
  REGISTER:        '/api/auth/register',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  VERIFY_CODE:     '/api/auth/verify-code',
  RESET_PASSWORD:  '/api/auth/reset-password',
  VALIDATE_USER:   '/api/auth/validate-user',

  // ── Endpoints no implementados en backend (definidos para uso futuro) ───────
  LOGOUT:          '/auth/logout',
  ME:              '/users/me',
  MY_BIDS:         '/users/me/bids',
  MY_AUCTIONS:     '/users/me/auctions',
  AUCTIONS:        '/auctions',
  AUCTION_BY_ID:   (id) => `/auctions/${id}`,
  UPLOAD_IMAGES:   '/auctions/upload-images',
  SUGGESTIONS:     '/auctions/search/suggestions',
  CALENDAR:        '/auctions/calendar',
  AUCTION_STATUS:  (id) => `/auctions/${id}/status`,
  SHARE_LINK:      (id) => `/auctions/${id}/share-link`,
  BIDS:            '/bids',
  CHATS:           '/chats',
  MESSAGES:        (id) => `/chats/${id}/messages`,
  NOTIFICATIONS:   '/notifications',
  MARK_READ:       (id) => `/notifications/${id}/read`,
  SETTINGS:        '/settings',
  PAYMENT_METHODS: '/settings/payment-methods',
  PAYMENT_BY_ID:   (id) => `/settings/payment-methods/${id}`,
  FAQ:             '/help/faq',
};