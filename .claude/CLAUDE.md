# SubastUP — Claude Code Context

App móvil de subastas. Monorepo con `backend/` (Express + Prisma + PostgreSQL) y `frontend/` (React Native + Expo, **JavaScript puro**).

---

## Contexto por tema

- Arquitectura general y stack → @.claude/arquitectura.md
- Base de datos y modelos Prisma → @.claude/database.md
- Endpoints de la API → @.claude/endpoints.md
- Navegación del frontend → @.claude/navegacion.md
- Convenciones de código → @.claude/convenciones.md
- Variables de entorno y configuración → @.claude/config.md
- Deploy (Railway + APK) → @.claude/deploy.md

---

## Comandos rápidos

```bash
# Backend
cd backend && npm run dev          # servidor con hot reload en :3000
npx prisma migrate dev             # aplicar migraciones
npx prisma studio                  # explorador visual de la BD

# Frontend
cd frontend && npm start           # Expo Go (QR para el celular)
```

---

## Advertencias críticas ⚠️

- **No usar `localhost`** en `BASE_URL` del frontend. Usar la IP local de la PC (ej: `192.168.1.100:3000`)
- **No subir `.env`** al repo. Está en `.gitignore`
- **No crear instancias nuevas de axios**. Siempre importar `api` desde `src/services/api.js`
- **No editar la BD a mano**. Modificar `schema.prisma` y correr `prisma migrate dev`
- **Registrar siempre** los nuevos screens en el navigator antes de navegar a ellos
