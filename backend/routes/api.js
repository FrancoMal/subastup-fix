// services/api.js
// Cliente HTTP centralizado para comunicarse con el backend

import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Cambiá esta URL por la IP/dominio real de tu servidor ─────
// Ejemplos:
//   Desarrollo local (Android emulator): 'http://10.0.2.2:3000'
//   Desarrollo local (dispositivo físico): 'http://192.168.X.X:3000'
//   Producción: 'https://api.tudominio.com'
const BASE_URL = 'http://10.0.2.2:3000';

export const ENDPOINTS = {
  LOGIN:           '/api/auth/login',
  REGISTER:        '/api/auth/register',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  VERIFY_CODE:     '/api/auth/verify-code',
  RESET_PASSWORD:  '/api/auth/reset-password',
  VALIDATE_USER:   '/api/auth/validate-user',
};

// ── Helper base ───────────────────────────────────────────────

async function request(endpoint, options = {}) {
  const token = await AsyncStorage.getItem('authToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Lanzar el mensaje del backend como error
    const error = new Error(data.message || 'Error desconocido');
    error.status    = response.status;
    error.data      = data;
    throw error;
  }

  return data;
}

// ── Métodos exportados ────────────────────────────────────────

const api = {
  post: (endpoint, body) =>
    request(endpoint, {
      method: 'POST',
      body:   JSON.stringify(body),
    }),

  get: (endpoint) =>
    request(endpoint, { method: 'GET' }),
};

export default api;
