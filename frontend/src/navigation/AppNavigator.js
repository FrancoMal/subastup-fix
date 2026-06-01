import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import useAuthStore             from '../store/authStore';
import SplashScreen             from '../screens/SplashScreen';
import HomeUnauthenticatedScreen from '../screens/tabs/HomeUnauthenticatedScreen';
import AuthNavigator            from './AuthNavigator';
import TabNavigator             from './TabNavigator';
import AuctionListScreen from '../screens/auction/AuctionListScreen';
import AuctionDetailScreen from '../screens/auction/AuctionDetailScreen';
import RegisterScreen2 from '../screens/auth/RegisterScreen2';
import CalendarScreen from '../screens/tabs/CalendarScreen';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoggedIn, init } = useAuthStore();
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
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="HomeUnauth" component={HomeUnauthenticatedScreen} options={{ gestureEnabled: false }} />
            <Stack.Screen name="Calendar" component={CalendarScreen} />
            <Stack.Screen name="AuctionList" component={AuctionListScreen} />
            <Stack.Screen name="RegisterStep2" component={RegisterScreen2} />
            <Stack.Screen name="Auth" component={AuthNavigator} options={{ animationEnabled: false }} />
            <Stack.Screen name="AuctionDetail" component={AuctionDetailScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={TabNavigator} />

        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
