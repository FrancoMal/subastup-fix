# Endpoints de la API — SubastUP

Base URL en desarrollo: `http://192.168.X.X:3000` (IP local de la PC)
Base URL en producción: Railway (configurar en `frontend/src/constants/api.js`)

Los endpoints que requieren auth esperan: `Authorization: Bearer <token>`
El interceptor de Axios en `services/api.js` agrega el header automáticamente.

## Autenticación `/auth`

| Método | Ruta | Auth | Body | Respuesta |
|---|---|---|---|---|
| POST | `/auth/register` | ❌ | name, lastName, dni, phone, email, password, avatarUrl, address... | 201 → token, userId, name |
| POST | `/auth/login` | ❌ | email, password | 200 → token, userId, name |
| POST | `/auth/logout` | ✅ | — | 200 |
| POST | `/auth/forgot-password` | ❌ | email | 200 (+ code en DEV) |
| POST | `/auth/verify-code` | ❌ | email, code | 200 |
| POST | `/auth/reset-password` | ❌ | email, code, newPassword, confirmPassword | 200 |

## Usuarios `/users`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/users/me` | ✅ | Perfil del usuario autenticado |
| PUT | `/users/me` | ✅ | Editar perfil |
| GET | `/users/me/bids` | ✅ | Historial de pujas |
| GET | `/users/me/auctions` | ✅ | Subastas publicadas |

## Subastas `/auctions`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/auctions` | ❌ | Listar con filtros: `?category=&status=&search=&currency=&page=&size=` |
| POST | `/auctions` | ✅ | Crear subasta |
| POST | `/auctions/upload-images` | ✅ | Subir imágenes (multipart), devuelve `imageUrls[]` |
| GET | `/auctions/search/suggestions` | ❌ | Autocompletado: `?q=texto` |
| GET | `/auctions/calendar` | ❌ | Por mes: `?month=&year=` → `{ activeNow[], scheduled[] }` |
| GET | `/auctions/:id` | ❌ | Detalle + `remainingSeconds` + `topBid` |
| PATCH | `/auctions/:id/status` | ✅ | `{ action: ACCEPT\|REJECT, reason? }` — solo en PENDING |
| GET | `/auctions/:id/share-link` | ❌ | Devuelve `{ shareUrl }` |

## Pujas `/bids`

| Método | Ruta | Auth | Body | Notas |
|---|---|---|---|---|
| POST | `/bids` | ✅ | `{ auctionId, amount }` | amount debe superar currentPrice; vendedor no puede pujar |

## Chats `/chats`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/chats` | ✅ | Lista de chats con preview del último mensaje |
| GET | `/chats/:chatId/messages` | ✅ | Mensajes paginados (`?page=0`) |
| POST | `/chats/:chatId/messages` | ✅ | Enviar mensaje (text y/o attachment multipart) |

## Notificaciones `/notifications`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/notifications` | ✅ | Todas las notificaciones del usuario |
| PATCH | `/notifications/:id/read` | ✅ | Marcar una como leída |

## Configuración `/settings`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/settings` | ✅ | Obtener configuración |
| PUT | `/settings` | ✅ | `{ theme, preferredCurrency, notificationsEnabled }` |
| GET | `/settings/payment-methods` | ✅ | Métodos de pago |
| POST | `/settings/payment-methods` | ✅ | `{ type, label, isDefault }` |
| DELETE | `/settings/payment-methods/:id` | ✅ | Eliminar método |

## Ayuda `/help`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/help/faq` | ❌ | Array de `{ id, question, answer }` |

## ENDPOINTS constants (frontend)

Todos los paths están centralizados en `frontend/src/constants/api.js`.
Para rutas dinámicas se usan funciones: `AUCTION_BY_ID: (id) => /auctions/${id}`
Nunca escribir la ruta como string hardcodeado en un screen o service.
