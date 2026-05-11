import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import useAuthStore from '../store/authStore';
import { COLORS }   from '../constants/colors';
import AuthNavigator from './AuthNavigator';
import TabNavigator  from './TabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoggedIn, init } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
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
