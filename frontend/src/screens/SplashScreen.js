import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { COLORS } from '../constants/colors';

export default function SplashScreen() {
  // Animación de fade-in para el logo
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Logo con animación */}
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image
          source={require('../assets/images/banner_subastup.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Spinner rojo */}
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={styles.spinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logo: {
    width: 220,
    height: 220,
  },
  spinner: {
    position: 'absolute',
    bottom: '30%',
  },
});
