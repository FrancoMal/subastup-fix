# Correcciones realizadas

## Auditoría de tablas base de la consigna

- Estado: revisado; no cumple todavía con la restricción de inmutabilidad.
- Fuentes comparadas: `estructurabasica.sql` y `backend/prisma/schema.prisma`.
- Hallazgo: `personas` incorpora `telefono`; `productos` incorpora `nombre`, `estado`, `motivoRechazo` y `direccionEnvio`, y cambia `revisor` de obligatorio a opcional.
- Hallazgo: `itemscatalogo` incorpora `moneda`, fechas, lugar, estado de cierre y otros campos; `pujos` incorpora `fecha`.
- Alcance: no se modificaron `schema.prisma`, migraciones ni la base de datos durante esta auditoría. La conexión a Supabase está inaccesible, por lo que no puede confirmarse el estado físico actual de las tablas remotas.

## Chats: respuesta del endpoint

- Estado: aplicado; pendiente de verificación manual en Expo.
- Archivos: `frontend/src/screens/chat/ChatsScreen.js`.
- Cambio: se normaliza la respuesta de `GET /api/chats` para guardar únicamente arreglos y evitar `chats.filter is not a function`.
- Cambio: se adaptan los campos del contrato de conversaciones (`conversacionId`, `nombreProducto`, `sinLeer`, `ultimaFecha`, `portada`).

## Calendario: respuesta del endpoint

- Estado: aplicado; pendiente de verificación manual.
- Archivo: `frontend/src/screens/tabs/CalendarScreen.js`.
- Cambio: se extrae el arreglo desde `data.dias` para respetar la respuesta `{ ok, dias }` de `GET /api/auctions/calendar`.

## Mi Cuenta: perfil real

- Estado: aplicado; pendiente de verificación manual.
- Archivos: `frontend/src/screens/profile/MiCuentaScreen.js`.
- Cambio: carga el perfil con `GET /api/users/me`, muestra un indicador durante la carga y guarda nombre, teléfono y email con `PUT /api/users/me`.
- Cambio: usa la foto devuelta por el backend y restaura el último perfil real al cancelar la edición.

## Mi Cuenta: documento y contraseña

- Estado: aplicado; pendiente de verificación manual.
- Archivos: `frontend/src/screens/profile/MiCuentaScreen.js`, `backend/controllers/perfilController.js`.
- Cambio: permite modificar documento, validando que no pertenezca a otra persona.
- Cambio: incorpora contraseña actual y nueva contraseña en el formulario; el backend valida ambas antes de actualizar el hash.

## Configuraciones: hero del usuario

- Estado: aplicado; pendiente de verificación manual después de volver a iniciar sesión.
- Archivos: `frontend/src/screens/tabs/ConfiguracionScreen.js`, `frontend/src/store/authStore.js`.
- Cambio: el hero usa `user?.name` y `user?.email` sin textos hardcodeados.
- Cambio: el store conserva el email que devuelve el endpoint de login.

## Métodos de pago: listado, alta y eliminación

- Estado: aplicado; pendiente de verificación manual.
- Archivos: `frontend/src/screens/payments/MetodosDePagoScreen.js`, `frontend/src/screens/payments/AgregarMetodoPagoScreen.js`, `frontend/src/screens/payments/MetodoDePagoDetalleScreen.js`.
- Cambio: el listado consume `GET /api/settings/payment-methods`, muestra carga, estado vacío y errores; se refresca al volver desde alta o detalle.
- Cambio: los formularios de tarjeta, cuenta bancaria y cheque consumen sus endpoints específicos y muestran carga o errores durante el envío; el cheque conserva y envía la imagen capturada en base64.
- Cambio: la eliminación usa `DELETE /api/settings/payment-methods/:id`; al regresar, la lista se vuelve a cargar.

## Historial de pujas: estado vacío

- Estado: aplicado; pendiente de verificación manual.
- Archivo: `frontend/src/screens/tabs/InformacionScreen.js`.
- Cambio: extrae el arreglo desde `data.historial`, mantiene skeletons solo durante la carga y muestra “No tenés pujas registradas todavía.” cuando el usuario no tiene pujas.

## Mis subastas: navegación segura

- Estado: aplicado; pendiente de verificación manual.
- Archivo: `frontend/src/screens/tabs/ConfiguracionScreen.js`.
- Cambio: se reemplazó la navegación a `MisSubastas` —ruta inexistente— por un aviso de funcionalidad próxima, evitando el crash.

## Tus artículos en subasta: navegación segura

- Estado: aplicado; pendiente de verificación manual.
- Archivo: `frontend/src/screens/tabs/InformacionScreen.js`.
- Cambio: se comentó el `console.log` anterior y se muestra un aviso de funcionalidad próxima porque no existe una pantalla registrada para listar los artículos propios.

## Seed demo: usuarios, subastas y pujas

- Estado: creado; pendiente de ejecución con conexión a Supabase.
- Archivo: `backend/prisma/seed_demo.js`.
- Cambio: crea o reutiliza cuatro usuarios demo aprobados, con login y tarjeta verificada.
- Cambio: crea el personal técnico necesario, cuatro subastas activas para la próxima semana, productos aprobados, ítems disponibles y pujas de ejemplo.
- Cambio: cada alta verifica previamente los datos mediante `findFirst`, por lo que el script es idempotente.

## Seed demo: ejecución bloqueada por conectividad

- Estado: revisado; sin cambios en la base de datos.
- Evidencia: `node prisma/seed_demo.js` falló antes de la primera consulta útil con `PrismaClientInitializationError: Can't reach database server` hacia `aws-1-sa-east-1.pooler.supabase.com:6543`.
- Diagnóstico: la URL usa el pooler esperado y `pgbouncer=true`, pero la resolución/conexión de red al host no está disponible y falta declarar `sslmode=require`.
- Acción pendiente: usar hotspot o una red que resuelva el host, agregar `sslmode=require` a las URLs de Supabase y ejecutar nuevamente el seed. No ejecutar `prisma db push` ni migraciones para esta prueba.

## Rediseño de compatibilidad con la consigna

- Estado: autorizado y diferido hasta finalizar las tareas funcionales pendientes.
- Base de datos objetivo: PostgreSQL en Supabase; no se realizará conversión a MySQL.
- Objetivo: conservar sin modificaciones las tablas de `estructurabasica.sql` y trasladar los campos adicionales a nuevas tablas relacionadas.
- Dependencias: rediseñar `backend/prisma/schema.prisma`, adaptar controladores y reescribir `backend/prisma/seed_demo.js` antes de ejecutar datos demo.

## Modo oscuro: cobertura parcial

- Estado: diferido; pendiente de cobertura completa.
- Pantallas adaptadas: `frontend/src/screens/SplashScreen.js`, `frontend/src/screens/tabs/HomeUnauthenticatedScreen.js`, `frontend/src/screens/auth/VerifyCodeScreen.js` y `frontend/src/screens/auth/ResetPasswordScreen.js`.
- Pendiente: aplicar `useAppTheme()` a las pantallas restantes y reemplazar sus colores hardcodeados mediante estilos inline, sin reescribir los `StyleSheet`.

## Backend: compatibilidad con tablas base

- Estado: schema y controladores migrados; pendiente de validar contra Supabase.
- Cambio: los campos extendidos se trasladaron a `perfiles_contacto`, `productos_detalle`, `items_catalogo_detalle` y `pujos_detalle`.
- Cambio: los endpoints conservan rutas y métodos; perfil, productos, subastas, pujas, estadísticas y chat consultan las extensiones.
- Validación local: `prisma validate` exitoso y sintaxis de controladores verificada con `node --check`.
- Pendiente: aplicar las nuevas tablas en PostgreSQL mediante un procedimiento revisado, sin alterar las tablas base de `estructurabasica.sql`.

## Backend: aplicación de tablas satélite

- Estado: script creado; ejecución bloqueada por conectividad.
- Archivo: `backend/prisma/crear_extensiones.sql`.
- Garantía: usa solo `CREATE TABLE IF NOT EXISTS` sobre `perfiles_contacto`, `productos_detalle`, `items_catalogo_detalle` y `pujos_detalle`.
- Ejecución intentada: `npx prisma db execute --file prisma/crear_extensiones.sql --schema prisma/schema.prisma`.
- Resultado: `P1001` contra `aws-1-sa-east-1.pooler.supabase.com:5432`; no se modificó Supabase.

## Backend: reconciliación y seed de prueba

- Estado: completado en la base de pruebas PostgreSQL.
- Archivo: `backend/prisma/reconciliar_tablas_base.sql` eliminó las columnas ajenas a la consigna de las tablas base vacías y restauró `productos.revisor` como obligatorio.
- Archivo: `backend/prisma/crear_extensiones.sql` creó las cuatro tablas satélite.
- Verificación: 4 usuarios demo, 4 registros de `productos_detalle`, 4 de `items_catalogo_detalle`, 4 pujas y 4 registros de `pujos_detalle`.
- Seed: `seed_demo.js` es idempotente; una segunda ejecución no creó duplicados.

## Subastas: listado y detalle autenticado

- Estado: aplicado; pendiente de verificación manual en Expo.
- Archivos: `frontend/src/screens/auction/AuctionListScreen.js`, `frontend/src/screens/auction/AuctionListAuthScreen.js`, `frontend/src/screens/auction/AuctionDetailAuthScreen.js` y `backend/prisma/seed_demo.js`.
- Cambio: los listados ahora extraen `data.subastas` de la respuesta real de `GET /api/auctions` y convierten sus datos al formato que requieren las tarjetas.
- Cambio: se importó `ActivityIndicator`, eliminando el error de render de la carga en el detalle autenticado.
- Cambio: el detalle adapta la respuesta `{ subasta, articulos }` de `GET /api/auctions/:id`, consulta `GET /api/bids/:itemId/status` para mostrar datos y precio actuales, y envía la puja con el `itemId` correcto.
- Cambio: el seed deja las subastas demo en estado `abierta` y suma dos pujas de ejemplo para las categorías Oro y Plata. La última ejecución creó esas cuatro pujas.

## Flujo de participación, ganador y notificaciones

- Estado: implementado; pendiente de verificación integrada contra Render/Supabase.
- Archivos: `backend/controllers/pujasController.js`, `backend/controllers/pagosController.js`, `backend/controllers/authController.js`, `frontend/src/store/authStore.js`, `frontend/src/screens/auction/AuctionDetailAuthScreen.js` y `frontend/src/screens/tabs/HomeAuthenticatedScreen.js`.
- Regla de pago: al intentar ingresar una puja, la app consulta los métodos de pago reales y solo habilita el teclado si existe uno verificado. Si no existe o el backend lo rechaza, aparece el popup de método de pago requerido.
- Regla de categoría: se mantiene la navegación y consulta libre de cualquier subasta, pero al confirmar una puja el backend rechaza categorías superiores. El frontend muestra un popup con el motivo devuelto, sin registrar la puja.
- Cierre: la pantalla consulta periódicamente el estado del ítem; al expirar el plazo, el backend marca el ítem y la puja ganadora dentro de una transacción.
- Ganador: al cerrar, el backend crea una conversación persistente para el ganador —si no existía una para el producto— con un mensaje inicial provisorio, y registra una notificación `subasta_ganada` sin leer. El texto definitivo de términos podrá reemplazar el mensaje provisorio cuando sea provisto.
- Interfaz: el popup de ganador se decide con el `ganadorId` confirmado por el backend; al aceptar vuelve a Inicio. La campana de Inicio obtiene `data.notificaciones`, muestra el detalle y un contador de no leídas.
- Compatibilidad: no se modificó ninguna tabla base ni se alteraron rutas HTTP existentes; solo se enriquecieron respuestas ya existentes con los datos necesarios para el flujo.
