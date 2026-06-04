// screens/auth/RegisterScreen2.js
// Paso 2 del registro - envía todos los datos al backend real

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
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';

import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/colors';
import useRegisterStore from '../../store/registerStore';
import api, { ENDPOINTS } from '../../services/api';

const LOGO = require('../../assets/images/banner_principal.jpeg');

/** Convierte una URI local a base64 */
async function uriToBase64(uri) {
  if (!uri) return null;
  const response = await fetch(uri);
  const blob     = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // data:image/...;base64,...
    reader.onerror  = reject;
    reader.readAsDataURL(blob);
  });
}

export default function RegisterScreen2({ navigation }) {
  const step1Data        = useRegisterStore((state) => state.step1Data);
  const step2Data        = useRegisterStore((state) => state.step2Data);
  const setStep2Data     = useRegisterStore((state) => state.setStep2Data);
  const fotos            = useRegisterStore((state) => state.fotos);
  const setFotos         = useRegisterStore((state) => state.setFotos);
  const clearRegistration = useRegisterStore((state) => state.clearRegistration);

  const [activeTab,     setActiveTab]     = useState('register');
  const [modalVisible,  setModalVisible]  = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [serverError,   setServerError]   = useState('');

  const { control, handleSubmit, formState: { errors }, reset } = useForm({ defaultValues: step2Data });

  useFocusEffect(
    React.useCallback(() => { reset(step2Data); }, [step2Data, reset])
  );

  // ── Enviar registro completo al backend ────────────────────────────────────
  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');

    try {
      // Convertir fotos a base64
      const foto1Base64 = await uriToBase64(fotos.foto1);
      const foto2Base64 = await uriToBase64(fotos.foto2);

      // Armar payload completo
      const payload = {
        // Paso 1
        nombre:   step1Data.nombre,
        apellido: step1Data.apellido,
        dni:      step1Data.dni,
        telefono: step1Data.telefono,
        email:    step1Data.email,
        password: step1Data.password,
        // Paso 2
        direccion:    data.direccion,
        numero:       data.numero,
        ciudad:       data.ciudad,
        codigoPostal: data.codigoPostal,
        pais:         data.pais,
        // Fotos
        foto1Base64,
        foto2Base64,
      };

      await api.post(ENDPOINTS.REGISTER, payload);

      // Limpiar store
      setStep2Data(data);
      clearRegistration();
      setFotos({ foto1: null, foto2: null });
      reset();

      setModalVisible(true);

    } catch (err) {
      if (err.status === 409) {
        // Email o DNI duplicado
        setServerError(err.message);
      } else {
        setServerError('Hubo un problema al enviar el registro. Intentá de nuevo.');
      }
      Alert.alert('Error', err.message || 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  // ── Seleccionar foto ───────────────────────────────────────────────────────
  const handleFotoPress = async (fotoKey) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setFotos({ ...fotos, [fotoKey]: result.assets[0].uri });
    }
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
            <TouchableOpacity
              style={styles.stepItem}
              onPress={() => { handleSubmit((d) => { setStep2Data(d); navigation.navigate('Register'); })(); }}
            >
              <Text style={styles.stepText}>Paso 1</Text>
              <View style={styles.stepBar} />
            </TouchableOpacity>
            <View style={styles.stepItem}>
              <Text style={[styles.stepText, styles.stepActive]}>Paso 2</Text>
              <View style={[styles.stepBar, styles.stepBarActive]} />
            </View>
          </View>

          {/* Error del servidor */}
          {serverError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{serverError}</Text>
            </View>
          ) : null}

          {/* Fotos */}
          <Text style={styles.label}>Cargar fotos</Text>
          <View style={styles.fotosContainer}>
            {['foto1', 'foto2'].map((key) => (
              <TouchableOpacity key={key} style={styles.fotoBox} onPress={() => handleFotoPress(key)}>
                {fotos[key]
                  ? <Image source={{ uri: fotos[key] }} style={styles.fotoImage} />
                  : <Text style={styles.fotoPlaceholder}>+</Text>
                }
              </TouchableOpacity>
            ))}
          </View>

          {/* Dirección + Número */}
          <View style={styles.rowContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dirección</Text>
              <Controller control={control} name="direccion"
                rules={{ required: 'La dirección es obligatoria' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput style={[styles.input, errors.direccion && styles.inputError]}
                    onBlur={onBlur} onChangeText={onChange} value={value} />
                )}
              />
              {errors.direccion && <Text style={styles.fieldError}>{errors.direccion.message}</Text>}
            </View>
            <View style={styles.inputGroupSmall}>
              <Text style={styles.label}>Número</Text>
              <Controller control={control} name="numero"
                rules={{ required: 'Obligatorio' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput style={[styles.input, errors.numero && styles.inputError]}
                    onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="numeric" />
                )}
              />
              {errors.numero && <Text style={styles.fieldError}>{errors.numero.message}</Text>}
            </View>
          </View>

          {/* País */}
          <Text style={styles.label}>País</Text>
          <Controller control={control} name="pais"
            rules={{ required: 'El país es obligatorio' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={[styles.input, errors.pais && styles.inputError]}
                onBlur={onBlur} onChangeText={onChange} value={value} />
            )}
          />
          {errors.pais && <Text style={styles.fieldError}>{errors.pais.message}</Text>}

          {/* Ciudad */}
          <Text style={styles.label}>Ciudad</Text>
          <Controller control={control} name="ciudad"
            rules={{ required: 'La ciudad es obligatoria' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={[styles.input, errors.ciudad && styles.inputError]}
                onBlur={onBlur} onChangeText={onChange} value={value} />
            )}
          />
          {errors.ciudad && <Text style={styles.fieldError}>{errors.ciudad.message}</Text>}

          {/* Código postal */}
          <Text style={styles.label}>Código postal</Text>
          <Controller control={control} name="codigoPostal"
            rules={{ required: 'El código postal es obligatorio' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={[styles.input, errors.codigoPostal && styles.inputError]}
                onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="numeric" />
            )}
          />
          {errors.codigoPostal && <Text style={styles.fieldError}>{errors.codigoPostal.message}</Text>}

          {/* Botón finalizar */}
          <TouchableOpacity
            style={[styles.finalButton, loading && styles.finalButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.finalButtonText}>Finalizar</Text>
            }
          </TouchableOpacity>

        </ScrollView>

        {/* Modal de confirmación */}
        <Modal transparent visible={modalVisible} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
              <View style={styles.modalIcon}>
                <Text style={styles.modalIconText}>ⓘ</Text>
              </View>
              <Text style={styles.modalTitulo}>Aviso</Text>
              <Text style={styles.modalMensaje}>
                Tu registro fue enviado correctamente. Un administrador revisará tus datos y habilitará tu cuenta.
              </Text>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => { setModalVisible(false); navigation.navigate('HomeUnauth'); }}
              >
                <Text style={styles.modalBtnText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
  errorBanner: {
    backgroundColor: '#FFEBEE', borderRadius: RADIUS.md, padding: SPACING.sm,
    marginBottom: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.error,
  },
  errorBannerText: { color: COLORS.error, fontSize: FONTS.sizes.sm },
  label: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.secondary, marginBottom: SPACING.xs, marginTop: SPACING.lg },
  fotosContainer: { flexDirection: 'row', marginBottom: SPACING.lg, gap: SPACING.md },
  fotoBox: {
    flex: 1, height: 80, backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center',
  },
  fotoImage: { width: '100%', height: '100%', borderRadius: RADIUS.md },
  fotoPlaceholder: { fontSize: 32, color: COLORS.white, fontWeight: '700' },
  rowContainer: { flexDirection: 'row', gap: SPACING.md },
  inputGroup: { flex: 1.6 },
  inputGroupSmall: { flex: 1 },
  input: {
    height: 48, backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.md,
    fontSize: FONTS.sizes.md, color: COLORS.secondary, marginBottom: SPACING.lg,
  },
  inputError: { borderColor: COLORS.error },
  fieldError: { fontSize: FONTS.sizes.xs, color: COLORS.error, marginTop: -12, marginBottom: SPACING.md },
  finalButton: {
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderRadius: RADIUS.md, alignSelf: 'flex-end', marginTop: SPACING.lg,
  },
  finalButtonDisabled: { opacity: 0.6 },
  finalButtonText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },
  backButton: { marginBottom: SPACING.md, paddingVertical: SPACING.sm },
  backButtonText: { fontSize: FONTS.sizes.md, color: COLORS.primary, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, width: '100%', alignItems: 'center' },
  modalClose: { position: 'absolute', top: 14, right: 16 },
  modalCloseText: { fontSize: 18, color: '#555555' },
  modalIcon: { marginBottom: 8, marginTop: 8 },
  modalIconText: { fontSize: 40, color: '#1A1A1A' },
  modalTitulo: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  modalMensaje: { fontSize: 14, color: '#555555', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalBtn: { backgroundColor: '#8b0000', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 40 },
  modalBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
