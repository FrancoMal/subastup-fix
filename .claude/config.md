# Configuración y Variables de Entorno — SubastUP

## backend/.env

```env
# Base de datos — Railway la genera automáticamente al agregar el plugin PostgreSQL
DATABASE_URL="postgresql://usuario:contraseña@host:5432/subastup"

# JWT
JWT_SECRET="string-largo-y-random-minimo-32-caracteres"
JWT_EXPIRES_IN="7d"

# Servidor
PORT=3000
NODE_ENV=development   # cambiar a "production" en Railway

# Cloudinary — cuenta gratuita en cloudinary.com
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"
```

Copiar desde `backend/.env.example` con: `cp .env.example .env`

---

## frontend/src/constants/api.js — BASE_URL

```js
// DESARROLLO LOCAL con Expo Go en el celular:
// ⚠️  NO usar "localhost" — el celular no puede resolverlo
// Usar la IP local de la PC en la red WiFi
export const BASE_URL = 'http://192.168.X.X:3000';

// Para saber cuál es tu IP local:
// Windows: ipconfig → "Dirección IPv4"
// Mac/Linux: ifconfig | grep inet

// PRODUCCIÓN (Railway):
// export const BASE_URL = 'https://tu-proyecto.up.railway.app';
```

> El celular con Expo Go y la PC deben estar conectados a la **misma red WiFi**.

---

## app.json (Expo)

Configuración relevante:
```json
{
  "expo": {
    "name": "SubastUP",
    "slug": "subastup",
    "android": {
      "package": "com.dai.subastup",
      "permissions": ["CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
    },
    "plugins": ["expo-image-picker"]
  }
}
```

---

## Archivos que NUNCA van al repo

```
backend/.env
frontend/.env       (si se llegara a crear)
node_modules/
.expo/
build/
```

Ambos `.gitignore` ya los excluyen.
