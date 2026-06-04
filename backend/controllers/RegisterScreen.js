// screens/auth/RegisterScreen.js
// Paso 1 del registro - conectado al backend real

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';

import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/colors';
import useRegisterStore from '../../store/registerStore';

const LOGO = require('../../assets/images/banner_principal.jpeg');

export default function RegisterScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('register');

  const step1Data   = useRegisterStore((state) => state.step1Data);
  const setStep1Data = useRegisterStore((state) => state.setStep1Data);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ defaultValues: step1Data });

  useFocusEffect(
    React.useCallback(() => {
      reset(step1Data);
    }, [step1Data, reset])
  );

  const onSubmit = (data) => {
    setStep1Data(data);
    navigation.navigate('RegisterStep2');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'height' : 'height'}
      style={styles.flex}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('HomeUnauth')}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Image source={LOGO} style={styles.logo} />
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <View style={[styles.tabIndicator, activeTab === 'login' && styles.indicatorLeft, activeTab === 'register' && styles.indicatorRight]} />
            <TouchableOpacity style={styles.tab} onPress={() => { setActiveTab('login'); navigation.navigate('Login'); }}>
              <Text style={styles.tabText}>Iniciar sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('register')}>
              <Text style={styles.tabText}>Registrarse</Text>
            </TouchableOpacity>
          </View>

          {/* Steps */}
          <View style={styles.stepsContainer}>
            <View style={styles.stepItem}>
              <Text style={[styles.stepText, styles.stepActive]}>Paso 1</Text>
              <View style={[styles.stepBar, styles.stepBarActive]} />
            </View>
            <TouchableOpacity
              style={styles.stepItem}
              onPress={() => handleSubmit((data) => { setStep1Data(data); navigation.navigate('RegisterStep2'); })()}
            >
              <Text style={styles.stepText}>Paso 2</Text>
              <View style={styles.stepBar} />
            </TouchableOpacity>
          </View>

          {/* Nombre */}
          <Text style={styles.label}>Nombre</Text>
          <Controller
            control={control} name="nombre"
            rules={{ required: 'El nombre es obligatorio' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={[styles.input, errors.nombre && styles.inputError]}
                onBlur={onBlur} onChangeText={onChange} value={value} />
            )}
          />
          {errors.nombre && <Text style={styles.fieldError}>{errors.nombre.message}</Text>}

          {/* Apellido */}
          <Text style={styles.label}>Apellido</Text>
          <Controller
            control={control} name="apellido"
            rules={{ required: 'El apellido es obligatorio' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={[styles.input, errors.apellido && styles.inputError]}
                onBlur={onBlur} onChangeText={onChange} value={value} />
            )}
          />
          {errors.apellido && <Text style={styles.fieldError}>{errors.apellido.message}</Text>}

          {/* DNI */}
          <Text style={styles.label}>DNI</Text>
          <Controller
            control={control} name="dni"
            rules={{ required: 'El DNI es obligatorio' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={[styles.input, errors.dni && styles.inputError]}
                onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="numeric" />
            )}
          />
          {errors.dni && <Text style={styles.fieldError}>{errors.dni.message}</Text>}

          {/* Teléfono */}
          <Text style={styles.label}>Teléfono</Text>
          <Controller
            control={control} name="telefono"
            rules={{ required: 'El teléfono es obligatorio' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={[styles.input, errors.telefono && styles.inputError]}
                onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="phone-pad" />
            )}
          />
          {errors.telefono && <Text style={styles.fieldError}>{errors.telefono.message}</Text>}

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <Controller
            control={control} name="email"
            rules={{
              required: 'El email es obligatorio',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'El email no es válido' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={[styles.input, errors.email && styles.inputError]}
                onBlur={onBlur} onChangeText={onChange} value={value}
                keyboardType="email-address" autoCapitalize="none" />
            )}
          />
          {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}

          {/* Contraseña */}
          <Text style={styles.label}>Contraseña</Text>
          <Controller
            control={control} name="password"
            rules={{
              required: 'La contraseña es obligatoria',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={[styles.input, errors.password && styles.inputError]}
                onBlur={onBlur} onChangeText={onChange} value={value}
                secureTextEntry autoCapitalize="none" />
            )}
          />
          {errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}

          <View style={styles.spacer} />

          <TouchableOpacity style={styles.nextButton} onPress={handleSubmit(onSubmit)}>
            <Text style={styles.nextButtonText}>Siguiente  »</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxl, paddingBottom: SPACING.lg },
  headerContainer: { alignItems: 'center', marginBottom: SPACING.lg },
  logo: { width: '90%', height: undefined, aspectRatio: 2.5 },
  tabContainer: {
    flexDirection: 'row', backgroundColor: '#757575', borderRadius: RADIUS.md,
    marginBottom: SPACING.lg, height: 44, overflow: 'hidden', position: 'relative',
  },
  tabIndicator: { position: 'absolute', backgroundColor: '#8B0000', height: 44, borderRadius: RADIUS.md, zIndex: 0 },
  indicatorLeft: { width: '50%', left: 0 },
  indicatorRight: { width: '50%', left: '50%' },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', zIndex: 1 },
  tabText: { fontSize: FONTS.sizes.md, color: COLORS.white, fontWeight: '600' },
  stepsContainer: { flexDirection: 'row', marginBottom: SPACING.xxl },
  stepItem: { flex: 1, alignItems: 'center' },
  stepText: { fontSize: FONTS.sizes.sm, color: '#AAAAAA', fontWeight: '700', marginBottom: SPACING.xs },
  stepActive: { color: '#9B1C1C' },
  stepBar: { width: '100%', height: 3, backgroundColor: '#CCCCCC', borderRadius: 1.5 },
  stepBarActive: { backgroundColor: '#9B1C1C' },
  label: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.secondary, marginBottom: SPACING.xs, marginTop: SPACING.lg },
  input: {
    height: 48, backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.md,
    fontSize: FONTS.sizes.md, color: COLORS.secondary, marginBottom: SPACING.lg,
  },
  inputError: { borderColor: COLORS.error },
  fieldError: { fontSize: FONTS.sizes.xs, color: COLORS.error, marginTop: -12, marginBottom: SPACING.md },
  spacer: { flex: 1 },
  nextButton: {
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md, borderRadius: RADIUS.md, alignSelf: 'flex-end', marginTop: SPACING.lg,
  },
  nextButtonText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },
  backButton: { marginBottom: SPACING.md, paddingVertical: SPACING.sm },
  backButtonText: { fontSize: FONTS.sizes.md, color: COLORS.primary, fontWeight: '600' },
});
