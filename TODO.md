# TODO - Conectar ChatsScreen con ChatDetailScreen

- [ ] Plan confirmado.
- [x] Identificar causa: `ChatDetail` no está registrada en `AppNavigator.js`.
- [ ] Editar `frontend/src/navigation/AppNavigator.js`:
  - [ ] Importar `ChatsScreen` y `ChatDetailScreen`.
  - [ ] Agregar `<Stack.Screen name="Chats" ... />`.
  - [ ] Agregar `<Stack.Screen name="ChatDetail" ... />`.
- [ ] Test manual:
  - [ ] Abrir pantalla de chats.
  - [ ] Tocar un chat.
  - [ ] Verificar navegación a detalle.
- [ ] Si se rompe algo:
  - [ ] Revisar consola/stack de navegación.
  - [ ] Revertir cambios en `AppNavigator.js`.

