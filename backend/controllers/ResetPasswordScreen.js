// screens/auth/ResetPasswordScreen.js
// Resetea la contraseña usando el resetToken recibido de VerifyCodeScreen

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';

import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/colors';
import api, { ENDPOINTS } from '../../services/api';

const LOGO = require('../../assets/images/banner_principal.jpeg');

export default function ResetPasswordScreen({ navigation, route }) {
  const insets     = useSafeAreaInsets();
  const resetToken = route?.params?.resetToken ?? '';  // token JWT temporal del backend
  const email      = route?.params?.email      ?? '';

  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { nuevaPassword: '', confirmarPassword: '' } });

  const onSubmit = async ({ nuevaPassword, confirmarPassword }) => {
    setLoading(true);

    try {
      await api.post(ENDPOINTS.RESET_PASSWORD, {
        resetToken,
        newPassword:     nuevaPassword,
        confirmPassword: confirmarPassword,
      });

      setLoading(false);
      Alert.alert(
        'Contraseña actualizada',
        'Tu contraseña fue guardada correctamente. Podés iniciar sesión.',
        [{ text: 'Ir al login', onPress: () => navigation.navigate('Login') }]
      );

    } catch (err) {
      setLoading(false);
      if (err.status === 400) {
        Alert.alert('Error', err.message || 'No se pudo actualizar la contraseña.');
      } else {
        Alert.alert('Error', 'No se pudo actualizar la contraseña. Intentá de nuevo.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')}>
          <Ionicons name="arrow-back" size={22} color="#8b0000" />
          <Text style={styles.backText}>Volver al login</Text>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </View>

          {/* Nueva contraseña */}
          <Text style={styles.label}>Nueva Contraseña</Text>
          <View style={styles.passwordWrapper}>
            <Controller
              control={control} name="nuevaPassword"
              rules={{
                required: 'La contraseña es obligatoria',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.passwordInput}
                  onBlur={onBlur} onChangeText={onChange} value={value}
                  secureTextEntry={!showPass1} autoCapitalize="none"
                />
              )}
            />
            <TouchableOpacity onPress={() => setShowPass1(!showPass1)} style={styles.eyeBtn}>
              <Ionicons name={showPass1 ? 'eye-off-outline' : 'eye-outline'} size={22} color="#888" />
            </TouchableOpacity>
          </View>
          {errors.nuevaPassword && <Text style={styles.fieldError}>{errors.nuevaPassword.message}</Text>}

          {/* Repetir contraseña */}
          <Text style={styles.label}>Repita la Contraseña</Text>
          <View style={styles.passwordWrapper}>
            <Controller
              control={control} name="confirmarPassword"
              rules={{
                required: 'Confirmá tu contraseña',
                validate: (val) => val === watch('nuevaPassword') || 'Las contraseñas no coinciden',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.passwordInput}
                  onBlur={onBlur} onChangeText={onChange} value={value}
                  secureTextEntry={!showPass2} autoCapitalize="none"
                />
              )}
            />
            <TouchableOpacity onPress={() => setShowPass2(!showPass2)} style={styles.eyeBtn}>
              <Ionicons name={showPass2 ? 'eye-off-outline' : 'eye-outline'} size={22} color="#888" />
            </TouchableOpacity>
          </View>
          {errors.confirmarPassword && <Text style={styles.fieldError}>{errors.confirmarPassword.message}</Text>}

          <TouchableOpacity
            style={[styles.btnGuardar, loading && styles.btnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.btnGuardarText}>Guardar</Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 32, paddingTop: 12, paddingBottom: 4,
  },
  backText: { color: '#8b0000', fontSize: 14, fontWeight: '600' },
  scroll: { paddingHorizontal: 32, paddingTop: 32, paddingBottom: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 48 },
  logo: { width: '90%', height: undefined, aspectRatio: 2.5 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.secondary, marginBottom: 6 },
  passwordWrapper: {
    flexDirection: 'row', alignItems: 'center', height: 48,
    backgroundColor: COLORS.background, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 12, marginBottom: 20,
  },
  passwordInput: { flex: 1, fontSize: 14, color: COLORS.secondary },
  eyeBtn: { padding: 4 },
  fieldError: { fontSize: 12, color: '#C62828', marginTop: -14, marginBottom: 12 },
  btnGuardar: {
    height: 50, backgroundColor: '#8b0000', borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnGuardarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
