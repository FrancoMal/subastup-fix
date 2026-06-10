import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import useAuthStore             from '../store/authStore';
import SplashScreen             from '../screens/SplashScreen';
import HomeUnauthenticatedScreen from '../screens/tabs/HomeUnauthenticatedScreen';
import AuthNavigator            from './AuthNavigator';
import TabNavigator             from './TabNavigator';
import AuctionListScreen    from '../screens/auction/AuctionListScreen';
import AuctionDetailScreen  from '../screens/auction/AuctionDetailScreen';
import CalendarScreen       from '../screens/tabs/CalendarScreen';
import InformacionScreen    from '../screens/tabs/InformacionScreen';
import AyudaScreen          from '../screens/tabs/AyudaScreen';
import ConfiguracionScreen  from '../screens/tabs/ConfiguracionScreen';
import MiCuentaScreen       from '../screens/profile/MiCuentaScreen';
import CargarProductoScreen from '../screens/auction/CargarProductoScreen';
import AuctionListAuthScreen    from '../screens/auction/AuctionListAuthScreen';
import AuctionDetailAuthScreen  from '../screens/auction/AuctionDetailAuthScreen';
import ChatsScreen             from '../screens/chat/ChatsScreen';
import ChatDetailScreen        from '../screens/chat/ChatDetailScreen';

const Stack = createNativeStackNavigator();


export default function AppNavigator() {
  const { isLoggedIn, init } = useAuthStore();

  const DEV_FORCE_LOGIN = false; // ← SOLO DESARROLLO, sacar antes de entregar

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Corre init() y un timer de 3s en paralelo; espera a que ambos terminen.
    // Así el splash siempre dura al menos 3 segundos sin importar qué tan
    // rápido responda AsyncStorage.
    const timer = new Promise((resolve) => setTimeout(resolve, 3000));
    Promise.all([init(), timer]).finally(() => setLoading(false));
  }, []);

  // Mientras se inicializa la app, mostramos la SplashScreen
  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn && !DEV_FORCE_LOGIN ? (
          <>
            <Stack.Screen name="HomeUnauth" component={HomeUnauthenticatedScreen} options={{ gestureEnabled: false }} />
            <Stack.Screen name="Calendar" component={CalendarScreen} />
            <Stack.Screen name="AuctionList" component={AuctionListScreen} />
            <Stack.Screen name="Auth" component={AuthNavigator} options={{ animationEnabled: false }} />
            <Stack.Screen name="AuctionDetail"  component={AuctionDetailScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main"             component={TabNavigator} />
            <Stack.Screen name="Calendar"         component={CalendarScreen} />
            <Stack.Screen name="Informacion"      component={InformacionScreen} />
            <Stack.Screen name="Configuracion"    component={ConfiguracionScreen} />
            <Stack.Screen name="Ayuda"            component={AyudaScreen} />
            <Stack.Screen name="MiCuenta"         component={MiCuentaScreen} />
            <Stack.Screen name="CargarProducto"   component={CargarProductoScreen} />
            <Stack.Screen name="PujarAuth"        component={AuctionListAuthScreen} />
            <Stack.Screen name="AuctionDetailAuth"  component={AuctionDetailAuthScreen} />
            <Stack.Screen name="Chats" component={ChatsScreen} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />

          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
