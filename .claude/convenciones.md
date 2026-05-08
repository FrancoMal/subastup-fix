# Convenciones de Código — SubastUP

## General

- **JavaScript puro** en ambas carpetas. Sin TypeScript.
- Comillas simples `'` en todo el código
- `async/await` siempre. Nunca `.then().catch()` encadenado
- Sin comentarios obvios. Solo comentar el "por qué", no el "qué"

---

## Backend

### Controllers
- Exportar funciones nombradas: `module.exports = { register, login }`
- Nunca `export default` en el backend
- Todo controller **debe** tener `try/catch` con `next(err)` en el catch
- Errores con status específico:
  ```js
  const err = new Error('No encontrado');
  err.status = 404;
  next(err);
  ```
- Nunca poner lógica de negocio en las rutas, solo en controllers o services

### Rutas
- Un archivo por tag de la API (authRoutes, auctionRoutes, etc.)
- Las rutas que requieren auth siempre llevan `authMiddleware` antes del controller:
  ```js
  router.get('/me', authMiddleware, userController.getMe);
  ```

### Prisma
- Siempre usar `Number()` al parsear params de ruta: `{ id: Number(req.params.id) }`
- Para operaciones que modifican dos tablas a la vez, usar `prisma.$transaction`
- El `PrismaClient` se instancia una vez por archivo de controller, no una por request

---

## Frontend

### Screens
```js
// Estructura estándar de un screen
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/colors';

export default function NombreScreen({ navigation, route }) {
  return (
    <View style={styles.container}>
      {/* contenido */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
```

### Componentes
- `components/ui/` → genéricos y reutilizables en cualquier app (Button, Input, Card...)
- `components/shared/` → específicos de SubastUP (AuctionCard, BidRow, ChatPreview...)
- Siempre `export default` en componentes
- Props con nombre descriptivo, sin abreviaturas

### Estilos
- **Siempre** `StyleSheet.create()` al final del archivo
- **Nunca** hardcodear colores. Usar `COLORS.primary`, `COLORS.border`, etc.
- **Nunca** hardcodear espaciados. Usar `SPACING.md`, `SPACING.lg`, etc.
- Estilos inline solo para valores completamente dinámicos (ej: `{ width: progress + '%' }`)

### Llamadas a la API
- **Siempre** importar la instancia `api` de `src/services/api.js`
- **Nunca** crear una nueva instancia de axios ni usar fetch nativo
- Manejar errores así:
  ```js
  try {
    const { data } = await api.get(ENDPOINTS.AUCTIONS);
    setAuctions(data.content);
  } catch (err) {
    const message = err.response?.data?.error || 'Error al cargar subastas';
    setError(message);
  }
  ```

### Zustand stores
- Un archivo por dominio en `src/store/`
- Estado inicial bien definido con todos los campos
- Siempre incluir `isLoading` y `error` para operaciones async
- Patrón:
  ```js
  import { create } from 'zustand';
  const useNombreStore = create((set) => ({
    data: null,
    isLoading: false,
    error: null,
    fetchData: async () => {
      set({ isLoading: true, error: null });
      try {
        const { data } = await api.get(ENDPOINTS.XXX);
        set({ data, isLoading: false });
      } catch (err) {
        set({ error: err.response?.data?.error || 'Error', isLoading: false });
      }
    },
  }));
  export default useNombreStore;
  ```
