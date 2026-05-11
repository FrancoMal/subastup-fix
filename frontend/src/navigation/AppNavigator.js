import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import useAuthStore    from '../store/authStore';
import AuthNavigator   from './AuthNavigator';
import TabNavigator    from './TabNavigator';
import SplashScreen    from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoggedIn, init } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inicializa el store de auth (recupera sesión guardada, etc.)
    init().finally(() => setLoading(false));
  }, []);

  // Mientras se inicializa la app, mostramos la SplashScreen
  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn
          ? <Stack.Screen name="Auth" component={AuthNavigator} />
          : <Stack.Screen name="Main" component={TabNavigator} />
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}
