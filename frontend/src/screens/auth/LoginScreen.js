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
} from 'react-native';
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
    try {
      clearError();            // limpia errores previos del store
      await login(email, password);
      // AppNavigator detecta isLoggedIn = true y redirige solo
    } catch {
      // el error ya fue guardado en el store, se muestra abajo
    }
  };

  return (
    /*
     * KeyboardAvoidingView: sube el contenido cuando aparece el teclado
     * para que los inputs no queden tapados, especialmente en iOS.
     */
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Logo ──────────────────────────────────────────────────── */}
        <View style={styles.logoWrapper}>
          <Image
            source={LOGO}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="SubastUp logo"
          />
        </View>

        {/* ── Título ────────────────────────────────────────────────── */}
        <Text style={styles.title}>Iniciá sesión</Text>
        <Text style={styles.subtitle}>Ingresá tus datos para continuar</Text>

        {/* ── Error global del store (ej: credenciales incorrectas) ─── */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Campo: Email ──────────────────────────────────────────── */}
        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'El email es obligatorio',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Ingresá un email válido',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="ejemplo@correo.com"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {/* Mensaje de error inline del campo */}
        {errors.email && (
          <Text style={styles.fieldError}>{errors.email.message}</Text>
        )}

        {/* ── Campo: Contraseña ─────────────────────────────────────── */}
        <Text style={styles.label}>Contraseña</Text>
        <Controller
          control={control}
          name="password"
          rules={{
            required: 'La contraseña es obligatoria',
            minLength: { value: 6, message: 'Mínimo 6 caracteres' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={[styles.passwordWrapper, errors.password && styles.inputError]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry={!showPassword}
                autoComplete="password"
                returnKeyType="done"
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={handleSubmit(onSubmit)}
                value={value}
              />
              {/* Botón para alternar visibilidad de la contraseña */}
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeButton}
                accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.password && (
          <Text style={styles.fieldError}>{errors.password.message}</Text>
        )}

        {/* ── Link: Olvidé contraseña ───────────────────────────────── */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotWrapper}
        >
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        {/* ── Botón principal: Ingresar ─────────────────────────────── */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.buttonText}>Ingresar</Text>
          }
        </TouchableOpacity>

        {/* ── Link: Ir a Registro ───────────────────────────────────── */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>¿No tenés cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Registrate</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Estilos ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  flex: { flex: 1, backgroundColor: COLORS.white },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },

  /* Logo */
  logoWrapper: { alignItems: 'center', marginBottom: SPACING.lg },
  logo: { width: '55%', height: undefined, aspectRatio: 2.5 },

  /* Títulos */
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.placeholder,
    marginBottom: SPACING.lg,
  },

  /* Banner de error del store */
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorBannerText: { color: COLORS.error, fontSize: FONTS.sizes.sm },

  /* Labels e inputs */
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    height: 50,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.secondary,
  },
  inputError: { borderColor: COLORS.error },

  /* Input contraseña con botón de ojo */
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  passwordInput: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.secondary,
  },
  eyeButton: { padding: SPACING.xs },
  eyeText: { fontSize: 18 },

  /* Error inline del campo */
  fieldError: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.error,
    marginTop: 4,
  },

  /* Link olvidé contraseña */
  forgotWrapper: { alignSelf: 'flex-end', marginTop: SPACING.sm },
  forgotText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },

  /* Botón principal */
  button: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },

  /* Fila ir a registro */
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  registerText: { fontSize: FONTS.sizes.sm, color: COLORS.placeholder },
  registerLink: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
