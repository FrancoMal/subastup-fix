# Arquitectura y Stack — SubastUP

## Estructura del repositorio

```
SubastUP/
├── .claude/               ← contexto para Claude Code
├── backend/               ← API REST
│   ├── prisma/
│   │   └── schema.prisma  ← fuente de verdad del modelo de datos
│   └── src/
│       ├── app.js         ← Express setup + middlewares + montaje de rutas
│       ├── server.js      ← entry point
│       ├── routes/        ← un archivo por tag (auth, auctions, bids...)
│       ├── controllers/   ← lógica de cada endpoint
│       ├── middlewares/   ← authMiddleware, errorHandler, uploadMiddleware
│       └── services/      ← lógica de negocio reutilizable
└── frontend/
    ├── App.js             ← entry point: PaperProvider + AppNavigator
    └── src/
        ├── navigation/    ← AppNavigator, AuthNavigator, TabNavigator
        ├── screens/       ← auth/, tabs/, auction/, chat/, profile/
        ├── components/    ← ui/ (genéricos), shared/ (app-específicos)
        ├── services/      ← api.js (Axios con interceptor JWT)
        ├── store/         ← Zustand stores
        ├── constants/     ← colors.js, api.js (BASE_URL + ENDPOINTS)
        ├── hooks/         ← custom hooks
        └── utils/         ← helpers (formatCurrency, formatDate...)
```

## Stack Backend

| Capa | Tech | Notas |
|---|---|---|
| Framework | Express ^4.21 | app.js monta todas las rutas |
| ORM | Prisma ^5.22 | schema en `prisma/schema.prisma` |
| Base de datos | PostgreSQL | hosteado en Railway |
| Auth | jsonwebtoken + bcryptjs | JWT con expiración en `JWT_EXPIRES_IN` |
| Imágenes | Cloudinary + multer | `uploadMiddleware.js` sube directo a Cloudinary |
| Validación | express-validator | en los controllers |

## Stack Frontend

| Capa | Tech | Notas |
|---|---|---|
| Framework | Expo ~53.0 managed | JavaScript, sin TypeScript |
| Navegación | React Navigation v6 | ver @.claude/navegacion.md |
| Estado global | Zustand ^5.0 | authStore + futuros stores |
| HTTP | Axios ^1.7 | instancia única en services/api.js |
| UI | React Native Paper ^5.13 | tema configurado en App.js |
| Formularios | React Hook Form ^7.54 | — |
| Storage local | AsyncStorage ^2.1 | token JWT |
| Imágenes | Expo Image Picker ^16.0 | para subastas y avatar |

## Paleta de colores

Todos los valores en `frontend/src/constants/colors.js`.

```js
primary:      '#B71C1C'  // Rojo oscuro del logo
primaryLight: '#E53935'  // Estados presionados
secondary:    '#212121'  // Negro, texto principal
background:   '#F5F5F5'  // Fondo general
surface:      '#FFFFFF'  // Fondo de cards
border:       '#E0E0E0'  // Separadores
success:      '#2E7D32'  // Pujas exitosas
timerWarning: '#FF6F00'  // Contador cuando queda poco tiempo
```
