import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import useAuthStore from '../../store/authStore';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/colors';

export default function LoginScreen({ navigation }) {
  const [rememberUser, setRememberUser] = useState(false);
  const { login, isLoading } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password);
      // AppNavigator detecta el cambio en isLoggedIn y redirige automáticamente
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* ── Logo ───────────────────────────────────── */}
      <Image
        source={require('../../assets/images/banner_subastup.jpeg')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* ── Tabs Iniciar sesión / Registrarse ───────── */}
      <View style={styles.tabContainer}>
        <View style={styles.tabActive}>
          <Text style={styles.tabTextActive}>Iniciar sesion</Text>
        </View>
        <TouchableOpacity
          style={styles.tabInactive}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.tabTextInactive}>Registrarse</Text>
        </TouchableOpacity>
      </View>

      {/* ── Formulario ──────────────────────────────── */}
      <View style={styles.form}>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'El email es obligatorio',
            pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              onChangeText={onChange}
              value={value}
              placeholder=""
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

        {/* Contraseña */}
        <Text style={[styles.label, { marginTop: SPACING.md }]}>Contraseña</Text>
        <Controller
          control={control}
          name="password"
          rules={{ required: 'La contraseña es obligatoria' }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              onChangeText={onChange}
              value={value}
              placeholder=""
              secureTextEntry
            />
          )}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

        {/* Botón Ingresar */}
        <TouchableOpacity
          style={[styles.btnIngresar, isLoading && styles.btnDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.btnIngresarText}>Ingresar</Text>
          }
        </TouchableOpacity>

        {/* Recordar usuario */}
        <View style={styles.rememberRow}>
          <Switch
            value={rememberUser}
            onValueChange={setRememberUser}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
          <Text style={styles.rememberText}>Recordar Usuario</Text>
        </View>

      </View>

      {/* ── Olvidé mi contraseña ────────────────────── */}
      <TouchableOpacity
        style={styles.forgotContainer}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        <Text style={styles.forgotText}>Olvide mi contraseña</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingBottom: SPACING.xxl,
  },

  // Logo
  logo: {
    width: 200,
    height: 160,
    marginTop: 48,
    marginBottom: SPACING.lg,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    width: '80%',
  },
  tabActive: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
  },
  tabInactive: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONTS.sizes.md,
  },
  tabTextInactive: {
    color: COLORS.secondary,
    fontWeight: '500',
    fontSize: FONTS.sizes.md,
  },

  // Formulario
  form: {
    width: '80%',
  },
  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#D9D9D9',
    borderRadius: RADIUS.sm,
    height: 44,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.secondary,
  },
  inputError: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.xs,
    marginTop: 4,
  },

  // Botón Ingresar
  btnIngresar: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnIngresarText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Recordar usuario
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  rememberText: {
    color: COLORS.secondary,
    fontSize: FONTS.sizes.md,
  },

  // Olvidé contraseña
  forgotContainer: {
    marginTop: 'auto',
    paddingTop: SPACING.xl,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    textDecorationLine: 'underline',
  },
});
