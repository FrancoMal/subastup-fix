# Deploy — SubastUP

## Backend → Railway

1. Crear cuenta en [railway.app](https://railway.app) (gratis para estudiantes con GitHub Student Pack)
2. **New Project → Deploy from GitHub repo**
3. Seleccionar el repo y configurar **Root Directory** como `backend`
4. Agregar plugin **PostgreSQL** desde el dashboard → Railway genera `DATABASE_URL` automáticamente
5. En **Variables** del servicio, agregar:
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` = `7d`
   - `NODE_ENV` = `production`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
6. Railway hace deploy automático con cada push a `main`
7. Copiar la URL pública generada (ej: `https://subastup.up.railway.app`)
8. Pegarla como `BASE_URL` en `frontend/src/constants/api.js`

> La primera migración se corre manualmente desde la terminal de Railway
> o con `npx prisma migrate deploy` en el pipeline de build.

---

## Frontend → APK (Android)

### Opción 1: EAS Build (recomendado)
```bash
cd frontend
npm install -g eas-cli
eas login                           # iniciar sesión con cuenta Expo
eas build:configure                 # genera eas.json
eas build -p android --profile preview   # genera APK descargable
```
El APK se genera en la nube de Expo y se puede descargar desde expo.dev.

### Opción 2: Build local (requiere Android Studio)
```bash
cd frontend
npx expo run:android
```

### Opción 3: Expo Go (para desarrollo y pruebas)
```bash
cd frontend
npm start    # escanear QR con Expo Go instalado en el celular
```
No genera APK, pero sirve para probar en tiempo real.

---

## Flujo de trabajo en equipo

```
main          ← rama de producción, solo merge cuando está probado
├── develop   ← rama de integración
│   ├── feature/login-screen
│   ├── feature/auction-detail
│   └── feature/bid-flow
```

Pull Request de `feature/*` → `develop` → revisar → merge a `main`.
