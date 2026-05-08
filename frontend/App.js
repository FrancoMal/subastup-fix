import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';

import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/colors';

// Tema de React Native Paper con los colores de SubastUP
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary:   COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.background,
    surface:   COLORS.surface,
    error:     COLORS.error,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="light" backgroundColor={COLORS.primary} />
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
