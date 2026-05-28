import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native'; // Import SafeAreaView
import { useForm, Controller } from 'react-hook-form';

import useAuthStore from '../../store/authStore';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/colors';

// Logo de la app
const LOGO = require('../../assets/images/banner_principal.jpeg');

/**
 * LoginScreen
 *
 * Pantalla de inicio de sesión. Permite al usuario ingresar email y
 * contraseña para autenticarse. Conectado al authStore via Zustand.
 *
 * Navegación disponible:
 *   - Register       → pantalla de registro
 *   - ForgotPassword → recuperación de contraseña
 */
export default function LoginScreen({ navigation }) {
  // Estado local para mostrar/ocultar la contraseña
  const [showPassword, setShowPassword] = useState(false);
  // Estado para recordar usuario
  const [rememberMe, setRememberMe] = useState(true);
  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState('login');

  // Acciones e indicador de carga del store de autenticación
  const { login, isLoading, error, clearError } = useAuthStore();

  // react-hook-form: control, errores y handleSubmit
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  // Se ejecuta cuando el formulario es válido
  const onSubmit = async ({ email, password }) => {
    clearError();
    await login(email, password);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'height' : 'height'}
      style={styles.flex}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <SafeAreaView style={styles.flex}>
        <ScrollView 
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
        {/* Botón de volver */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('HomeUnauth')}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.headerContainer}>
          <Image source={LOGO} style={styles.logo} />
        </View>

        {/* Tabs: Iniciar sesión / Registrarse */}
        <View style={styles.tabContainer}>
          <View style={[styles.tabIndicator, activeTab === 'login' && styles.indicatorLeft, activeTab === 'register' && styles.indicatorRight]} />
          <TouchableOpacity 
            style={styles.tab}
            onPress={() => setActiveTab('login')}
          >
            <Text style={styles.tabText}>Iniciar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tab}
            onPress={() => {
              setActiveTab('register');
              navigation.navigate('Register');
            }}
          >
            <Text style={styles.tabText}>Registrarse</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {/* Campo: Email */}
        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          rules={{ required: 'El email es obligatorio' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder=""
              placeholderTextColor={COLORS.white}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}

        {/* Campo: Contraseña */}
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passwordWrapper}>
          <Controller
            control={control}
            name="password"
            rules={{ required: 'La contraseña es obligatoria' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.passwordInput, errors.password && styles.inputError]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder=""
                placeholderTextColor={COLORS.white}
                secureTextEntry={!showPassword}
              />
            )}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}

        {/* Botón: Ingresar */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>

        {/* Toggle: Recordar Usuario */}
        <View style={styles.rememberMeRow}>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={rememberMe ? COLORS.white : COLORS.placeholder}
          />
          <Text style={styles.rememberMeText}>Recordar Usuario</Text>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Enlace: Olvidé mi contraseña */}
        <TouchableOpacity
          style={styles.forgotWrapperBottom}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotText}>Olvide mi contraseña</Text>
        </TouchableOpacity>
      </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ─── Estilos ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.white },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.lg,
  },

  // Logo + Título
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logo: { width: '90%', height: undefined, aspectRatio: 2.5 },
  titleContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  appSubtitle: {
    fontSize: 10,
    color: '#757575',
    letterSpacing: 1.2,
    marginTop: 2,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#7B7B7B',
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xxl,
    height: 44,
    overflow: 'hidden',
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    backgroundColor: '#8B0000',
    height: 44,
    borderRadius: RADIUS.md,
    zIndex: 0,
  },
  indicatorLeft: {
    width: '50%',
    left: 0,
  },
  indicatorRight: {
    width: '50%',
    left: '50%',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  tabText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    fontWeight: '600',
  },

  // Error Banner
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorBannerText: { color: COLORS.error, fontSize: FONTS.sizes.sm },

  // Labels
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.lg,
  },

  // Inputs
  input: {
    height: 48,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  inputError: { borderColor: COLORS.error },

  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  passwordInput: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
  },
  eyeButton: { padding: SPACING.xs },
  eyeText: { fontSize: 18 },

  fieldError: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.error,
    marginTop: -12,
    marginBottom: SPACING.md,
  },

  // Button
  button: {
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },

  // Remember Me
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  rememberMeText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.secondary,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },

  // Spacer
  spacer: {
    flex: 1,
  },

  // Back Button
  backButton: {
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Forgot Password
  forgotWrapperBottom: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  forgotText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.error,
    fontWeight: '600',
  },
});
