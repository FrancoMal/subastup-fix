// screens/auth/VerifyCodeScreen.js
// Verifica el código recibido por email → conectado al backend real

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import api, { ENDPOINTS } from '../../services/api';

const LOGO = require('../../assets/images/banner_principal.jpeg');

export default function VerifyCodeScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const email  = route?.params?.email ?? '';

  const [codigo,  setCodigo]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleValidar = async () => {
    if (!codigo.trim()) {
      setError('Ingresá el código que recibiste por mail.');
      return;
    }
    if (codigo.trim().length < 4) {
      setError('El código debe tener al menos 4 dígitos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // El backend devuelve un resetToken de un solo uso (válido 10 min)
      const data = await api.post(ENDPOINTS.VERIFY_CODE, {
        email: email.trim(),
        code:  codigo.trim(),
      });

      setLoading(false);
      // Pasar el resetToken a la pantalla de nueva contraseña
      navigation.navigate('ResetPassword', {
        email,
        code:       codigo.trim(),
        resetToken: data.resetToken,
      });

    } catch (err) {
      setLoading(false);
      if (err.status === 400) {
        setError(err.message || 'El código ingresado no es válido.');
      } else {
        setError('No se pudo verificar el código. Intentá de nuevo.');
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')}>
        <Ionicons name="arrow-back" size={22} color="#8b0000" />
        <Text style={styles.backText}>Volver al login</Text>
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </View>

      <Text style={styles.instruccion}>
        Ingresá el código de verificación que recibiste por mail
      </Text>

      {email ? (
        <Text style={styles.emailHint}>Enviado a: {email}</Text>
      ) : null}

      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={codigo}
        onChangeText={(t) => { setCodigo(t); setError(''); }}
        keyboardType="numeric"
        textAlign="center"
        maxLength={8}
        placeholder="- - - - - -"
        placeholderTextColor="#BBBBBB"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.btnValidar, loading && styles.btnDisabled]}
        onPress={handleValidar}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color="#FFFFFF" />
          : <Text style={styles.btnValidarText}>Validar</Text>
        }
      </TouchableOpacity>

      <View style={{ flex: 1 }} />

      <Text style={[styles.footerText, { marginBottom: insets.bottom + 24 }]}>
        Una vez validado el código, podrás reescribir tu contraseña
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 12, paddingBottom: 4 },
  backText: { color: '#8b0000', fontSize: 14, fontWeight: '600' },
  logoContainer: { alignItems: 'center', marginTop: 24, marginBottom: 40 },
  logo: { width: '90%', height: undefined, aspectRatio: 2.5 },
  instruccion: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', lineHeight: 26, marginBottom: 8 },
  emailHint: { fontSize: 13, color: '#888888', marginBottom: 20 },
  input: {
    height: 56,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 8,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputError: { borderColor: '#C62828' },
  errorText: { fontSize: 13, color: '#C62828', marginBottom: 16, textAlign: 'center' },
  btnValidar: {
    backgroundColor: '#8b0000',
    borderRadius: 10,
    height: 46,
    alignSelf: 'center',
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  btnValidarText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  footerText: { fontSize: 13, color: '#888888', textAlign: 'center', lineHeight: 20 },
});
