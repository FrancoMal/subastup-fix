import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import useAuthStore from '../store/authStore';
import { COLORS } from '../constants/colors';
import SplashScreen from '../screens/SplashScreen';

import AuthNavigator  from './AuthNavigator';
import TabNavigator   from './TabNavigator';

import AuctionDetailScreen  from '../screens/auction/AuctionDetailScreen';
import CreateAuctionScreen  from '../screens/auction/CreateAuctionScreen';
import ChatScreen           from '../screens/chat/ChatScreen';
import NotificationsScreen  from '../screens/profile/NotificationsScreen';
import EditProfileScreen    from '../screens/profile/EditProfileScreen';
import MyAuctionsScreen     from '../screens/profile/MyAuctionsScreen';
import MyBidsScreen         from '../screens/profile/MyBidsScreen';
import SettingsScreen       from '../screens/profile/SettingsScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import FaqScreen            from '../screens/profile/FaqScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoggedIn, init } = useAuthStore();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Mínimo 2 segundos de splash para que se vea la animación
    const minDelay = new Promise(resolve => setTimeout(resolve, 2000));
    const authInit = init();
    Promise.all([minDelay, authInit]).finally(() => setLoading(false));
  }, []);

  // Mientras carga, mostrar el Splash
  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="AuctionDetail"
              component={AuctionDetailScreen}
              options={{ headerShown: true, title: 'Detalle', headerTintColor: COLORS.primary }}
            />
            <Stack.Screen
              name="CreateAuction"
              component={CreateAuctionScreen}
              options={{ headerShown: true, title: 'Publicar subasta', headerTintColor: COLORS.primary }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ headerShown: true, headerTintColor: COLORS.primary }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ headerShown: true, title: 'Notificaciones', headerTintColor: COLORS.primary }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ headerShown: true, title: 'Editar perfil', headerTintColor: COLORS.primary }}
            />
            <Stack.Screen
              name="MyAuctions"
              component={MyAuctionsScreen}
              options={{ headerShown: true, title: 'Mis subastas', headerTintColor: COLORS.primary }}
            />
            <Stack.Screen
              name="MyBids"
              component={MyBidsScreen}
              options={{ headerShown: true, title: 'Mis pujas', headerTintColor: COLORS.primary }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ headerShown: true, title: 'Configuración', headerTintColor: COLORS.primary }}
            />
            <Stack.Screen
              name="PaymentMethods"
              component={PaymentMethodsScreen}
              options={{ headerShown: true, title: 'Métodos de pago', headerTintColor: COLORS.primary }}
            />
            <Stack.Screen
              name="Faq"
              component={FaqScreen}
              options={{ headerShown: true, title: 'Preguntas frecuentes', headerTintColor: COLORS.primary }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
