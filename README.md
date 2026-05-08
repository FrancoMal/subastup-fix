# SubastUP 🔨

App de subastas para la materia **Desarrollo de Aplicaciones I**

---

## 📁 Estructura del repositorio

```
SubastUP/
├── backend/    → API REST (Node.js + Express + Prisma + PostgreSQL)
└── frontend/   → App móvil (React Native + Expo)
```

---

## 🚀 Setup inicial (primera vez)

### Requisitos previos
- Node.js 18+
- Git
- Expo Go instalado en el celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

---

### 🔧 Backend

```bash
cd backend

# 1. Instalar dependencias
npm install

# 2. Crear el archivo de variables de entorno
cp .env.example .env
# → Editá el .env con tus datos de Railway y Cloudinary

# 3. Crear las tablas en la base de datos
npx prisma migrate dev --name init

# 4. (Opcional) Abrir el explorador visual de la BD
npx prisma studio

# 5. Correr el servidor en modo desarrollo
npm run dev
# → Corre en http://localhost:3000
```

**Variables de entorno necesarias** (en `.env`):
| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de PostgreSQL (Railway la genera automáticamente) |
| `JWT_SECRET` | String largo y random para firmar los tokens |
| `CLOUDINARY_CLOUD_NAME` | De tu cuenta en cloudinary.com |
| `CLOUDINARY_API_KEY` | De tu cuenta en cloudinary.com |
| `CLOUDINARY_API_SECRET` | De tu cuenta en cloudinary.com |

---

### 📱 Frontend

```bash
cd frontend

# 1. Instalar dependencias
npm install

# 2. Configurar la URL del backend
# → Abrí src/constants/api.js
# → Cambiá BASE_URL por la IP local de tu máquina
#   (no uses localhost, usá la IP del WiFi, ej: http://192.168.1.100:3000)

# 3. Iniciar Expo
npm start
# → Escaneá el QR con la app Expo Go en tu celular
```

> ⚠️ **Importante:** el celular y la PC deben estar en la **misma red WiFi**
> para que Expo Go pueda conectarse al backend local.

---

## 🌐 Deploy en Railway (backend + base de datos)

1. Crear cuenta en [railway.app](https://railway.app)
2. Crear proyecto → **Deploy from GitHub repo**
3. Seleccionar la carpeta `backend/`
4. Agregar plugin **PostgreSQL** → Railway genera `DATABASE_URL` automáticamente
5. Agregar las variables de entorno en el panel de Railway
6. Una vez deployado, copiar la URL pública y pegarla en `frontend/src/constants/api.js`

---

## 🗂️ Endpoints disponibles

| # | Método | Endpoint | Auth | Descripción |
|---|---|---|---|---|
| 1 | POST | `/auth/register` | ❌ | Registrar usuario |
| 2 | POST | `/auth/login` | ❌ | Iniciar sesión |
| 3 | POST | `/auth/logout` | ✅ | Cerrar sesión |
| 4 | POST | `/auth/forgot-password` | ❌ | Recuperar contraseña |
| 5 | POST | `/auth/verify-code` | ❌ | Verificar código |
| 6 | POST | `/auth/reset-password` | ❌ | Nueva contraseña |
| 7 | GET | `/users/me` | ✅ | Mi perfil |
| 8 | PUT | `/users/me` | ✅ | Editar perfil |
| 9 | GET | `/users/me/bids` | ✅ | Mis pujas |
| 10 | GET | `/users/me/auctions` | ✅ | Mis subastas |
| 11 | GET | `/auctions` | ❌ | Listar subastas |
| 12 | POST | `/auctions` | ✅ | Crear subasta |
| 13 | POST | `/auctions/upload-images` | ✅ | Subir imágenes |
| 14 | GET | `/auctions/search/suggestions` | ❌ | Autocompletado |
| 15 | GET | `/auctions/:id` | ❌ | Detalle subasta |
| 16 | PATCH | `/auctions/:id/status` | ✅ | Cambiar estado |
| 17 | GET | `/auctions/:id/share-link` | ❌ | Link para compartir |
| 18 | GET | `/auctions/calendar` | ❌ | Calendario |
| 19 | POST | `/bids` | ✅ | Realizar puja |
| 20 | GET | `/chats` | ✅ | Mis chats |
| 21 | GET | `/chats/:id/messages` | ✅ | Mensajes de un chat |
| 22 | POST | `/chats/:id/messages` | ✅ | Enviar mensaje |
| 23 | GET | `/notifications` | ✅ | Notificaciones |
| 24 | PATCH | `/notifications/:id/read` | ✅ | Marcar como leída |
| 25 | GET | `/settings` | ✅ | Mi configuración |
| 26 | PUT | `/settings` | ✅ | Guardar config |
| 27 | GET | `/settings/payment-methods` | ✅ | Mis pagos |
| 28 | POST | `/settings/payment-methods` | ✅ | Agregar método pago |
| 29 | DELETE | `/settings/payment-methods/:id` | ✅ | Eliminar método pago |
| 30 | GET | `/help/faq` | ❌ | Preguntas frecuentes |

---

## 👥 Equipo

Materia: Desarrollo de Aplicaciones I — DAI
