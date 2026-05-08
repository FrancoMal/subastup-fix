import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import useAuthStore from '../../store/authStore';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/colors';

export default function RegisterScreen({ navigation }) {
  const [paso, setPaso] = useState(1);
  const { register: registerUser, isLoading } = useAuthStore();

  const { control, handleSubmit, getValues, formState: { errors } } = useForm({
    defaultValues: {
      nombre:       '',
      apellido:     '',
      dni:          '',
      telefono:     '',
      email:        '',
      password:     '',
      confirmPass:  '',
      direccion:    '',
      numero:       '',
      ciudad:       '',
      codigoPostal: '',
    },
  });

  const handleSiguiente = handleSubmit(() => {
    setPaso(2);
  });

  const handleRegistrar = handleSubmit(async (data) => {
    if (data.password !== data.confirmPass) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    try {
      await registerUser({
        name:         data.nombre,
        lastName:     data.apellido,
        dni:          data.dni,
        phone:        data.telefono,
        email:        data.email,
        password:     data.password,
        address:      data.direccion,
        addressNumber: data.numero,
        city:         data.ciudad,
        postalCode:   data.codigoPostal,
      });
      // AppNavigator redirige automáticamente al detectar isLoggedIn = true
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* ── Logo ─────────────────────────────────────── */}
      <Image
        source={require('../../assets/images/banner_subastup.jpeg')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* ── Tabs Iniciar sesión / Registrarse ─────────── */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.tabInactive}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.tabTextInactive}>Iniciar sesion</Text>
        </TouchableOpacity>
        <View style={styles.tabActive}>
          <Text style={styles.tabTextActive}>Registrarse</Text>
        </View>
      </View>

      {/* ── Indicador de pasos ────────────────────────── */}
      <View style={styles.stepsContainer}>
        <View style={styles.stepItem}>
          <Text style={[styles.stepLabel, paso === 1 && styles.stepLabelActive]}>
            Paso 1
          </Text>
          <View style={[styles.stepBar, paso === 1 && styles.stepBarActive]} />
        </View>
        <View style={styles.stepItem}>
          <Text style={[styles.stepLabel, paso === 2 && styles.stepLabelActive]}>
            Paso 2
          </Text>
          <View style={[styles.stepBar, paso === 2 && styles.stepBarActive]} />
        </View>
      </View>

      {/* ── Formulario ────────────────────────────────── */}
      <View style={styles.form}>

        {paso === 1 ? (
          <>
            {/* Nombre */}
            <Text style={styles.label}>Nombre</Text>
            <Controller
              control={control}
              name="nombre"
              rules={{ required: 'El nombre es obligatorio' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.nombre && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="words"
                />
              )}
            />
            {errors.nombre && <Text style={styles.errorText}>{errors.nombre.message}</Text>}

            {/* Apellido */}
            <Text style={[styles.label, styles.labelMargin]}>Apellido</Text>
            <Controller
              control={control}
              name="apellido"
              rules={{ required: 'El apellido es obligatorio' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.apellido && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="words"
                />
              )}
            />
            {errors.apellido && <Text style={styles.errorText}>{errors.apellido.message}</Text>}

            {/* DNI */}
            <Text style={[styles.label, styles.labelMargin]}>DNI</Text>
            <Controller
              control={control}
              name="dni"
              rules={{ required: 'El DNI es obligatorio' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.dni && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.dni && <Text style={styles.errorText}>{errors.dni.message}</Text>}

            {/* Teléfono */}
            <Text style={[styles.label, styles.labelMargin]}>Telefono</Text>
            <Controller
              control={control}
              name="telefono"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="phone-pad"
                />
              )}
            />

            {/* Email */}
            <Text style={[styles.label, styles.labelMargin]}>Email</Text>
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
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

            {/* Botón Siguiente */}
            <TouchableOpacity
              style={styles.btnSiguiente}
              onPress={handleSiguiente}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>Siguiente  »</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Contraseña */}
            <Text style={styles.label}>Contraseña</Text>
            <Controller
              control={control}
              name="password"
              rules={{ required: 'La contraseña es obligatoria', minLength: { value: 6, message: 'Mínimo 6 caracteres' } }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                />
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

            {/* Confirmar contraseña */}
            <Text style={[styles.label, styles.labelMargin]}>Confirmar contraseña</Text>
            <Controller
              control={control}
              name="confirmPass"
              rules={{ required: 'Confirmá tu contraseña' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.confirmPass && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                />
              )}
            />
            {errors.confirmPass && <Text style={styles.errorText}>{errors.confirmPass.message}</Text>}

            {/* Dirección */}
            <Text style={[styles.label, styles.labelMargin]}>Dirección</Text>
            <Controller
              control={control}
              name="direccion"
              render={({ field: { onChange, value } }) => (
                <TextInput style={styles.input} onChangeText={onChange} value={value} />
              )}
            />

            {/* Número */}
            <Text style={[styles.label, styles.labelMargin]}>Número</Text>
            <Controller
              control={control}
              name="numero"
              render={({ field: { onChange, value } }) => (
                <TextInput style={styles.input} onChangeText={onChange} value={value} keyboardType="numeric" />
              )}
            />

            {/* Ciudad */}
            <Text style={[styles.label, styles.labelMargin]}>Ciudad</Text>
            <Controller
              control={control}
              name="ciudad"
              render={({ field: { onChange, value } }) => (
                <TextInput style={styles.input} onChangeText={onChange} value={value} autoCapitalize="words" />
              )}
            />

            {/* Código Postal */}
            <Text style={[styles.label, styles.labelMargin]}>Código Postal</Text>
            <Controller
              control={control}
              name="codigoPostal"
              render={({ field: { onChange, value } }) => (
                <TextInput style={styles.input} onChangeText={onChange} value={value} keyboardType="numeric" />
              )}
            />

            {/* Botones Volver / Registrarse */}
            <View style={styles.paso2Buttons}>
              <TouchableOpacity
                style={styles.btnVolver}
                onPress={() => setPaso(1)}
                activeOpacity={0.85}
              >
                <Text style={styles.btnVolverText}>« Volver</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnRegistrar, isLoading && styles.btnDisabled]}
                onPress={handleRegistrar}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading
                  ? <ActivityIndicator color={COLORS.white} />
                  : <Text style={styles.btnText}>Registrarse</Text>
                }
              </TouchableOpacity>
            </View>
          </>
        )}

      </View>
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
    marginBottom: SPACING.lg,
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

  // Pasos
  stepsContainer: {
    flexDirection: 'row',
    width: '80%',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  stepLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.placeholder,
    fontWeight: '500',
  },
  stepLabelActive: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
  stepBar: {
    width: '100%',
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
  },
  stepBarActive: {
    backgroundColor: COLORS.primary,
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
  labelMargin: {
    marginTop: SPACING.md,
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

  // Botones
  btnSiguiente: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    alignSelf: 'flex-end',
    paddingHorizontal: SPACING.xl,
  },
  btnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  paso2Buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  btnVolver: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnVolverText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  btnRegistrar: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.7,
  },
});
