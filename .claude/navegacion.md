# Navegación Frontend — SubastUP

Implementada con React Navigation v6. Archivos en `frontend/src/navigation/`.

## Árbol completo

```
AppNavigator  (src/navigation/AppNavigator.js)
│
│  [si !isLoggedIn]
├── AuthNavigator  (src/navigation/AuthNavigator.js)
│   ├── Login               ← pantalla inicial del flujo auth
│   ├── Register
│   ├── ForgotPassword
│   ├── VerifyCode
│   └── ResetPassword
│
│  [si isLoggedIn]
└── Stack principal
    ├── TabNavigator  (src/navigation/TabNavigator.js)  ← "Main"
    │   ├── Home            (tabs/HomeScreen.js)
    │   ├── Search          (tabs/SearchScreen.js)
    │   ├── Calendar        (tabs/CalendarScreen.js)
    │   ├── Chats           (tabs/ChatsScreen.js)
    │   └── Profile         (tabs/ProfileScreen.js)
    │
    └── Pantallas de detalle (sobre los tabs, headerShown: true)
        ├── AuctionDetail       params: { auctionId }
        ├── CreateAuction
        ├── Chat                params: { chatId, otherUserName }
        ├── Notifications
        ├── EditProfile
        ├── MyAuctions
        ├── MyBids
        ├── Settings
        ├── PaymentMethods
        └── Faq
```

## Cómo usar la navegación

```js
// Navegar a una pantalla
navigation.navigate('AuctionDetail', { auctionId: 42 });

// Leer params en la pantalla destino
const { auctionId } = route.params;

// Volver atrás
navigation.goBack();

// Desde un tab hacia una pantalla de detalle
// (usar el navigator padre, no el tab navigator)
navigation.navigate('Chat', { chatId: 5, otherUserName: 'Juan' });
```

## Lógica de auth en AppNavigator

`AppNavigator` llama a `useAuthStore().init()` al montarse.
`init()` lee el token de AsyncStorage y setea `isLoggedIn`.
Mientras carga muestra un `ActivityIndicator` centrado.
Una vez que `isLoggedIn` cambia, React Navigation redirige automáticamente.

## Cómo agregar una nueva pantalla

1. Crear el archivo en `src/screens/categoria/NombreScreen.js`
2. Importarlo en el navigator correspondiente
3. Agregar `<Stack.Screen name="Nombre" component={NombreScreen} />`
4. Si requiere header: `options={{ headerShown: true, title: 'Título' }}`
