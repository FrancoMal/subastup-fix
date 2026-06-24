import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';
import useAuthStore from '../../store/authStore';

// ─── Componente de campo (vista + edición unificados) ────────────────────────
const Campo = ({ label, value, onChange, editing, censurable, secureEntry, bloqueado, keyboardType }) => {
  const { theme } = useAppTheme();
  const [visible, setVisible] = useState(!secureEntry);

  const censurar = (texto) => {
    if (!texto) return '';
    return '•'.repeat(Math.min(texto.length, 16));
  };

  const valorMostrado = censurable && !visible ? censurar(value) : value;

  return (
    <View style={styles.campoContainer}>
      <Text style={[styles.campoLabel, { color: theme.secondary }]}>{label}</Text>
      <View style={[styles.campoFila, editing && !bloqueado && styles.campoFilaActiva]}>
        {editing && !bloqueado ? (
          <TextInput
            style={[styles.campoInput, { color: theme.secondary }]}
            value={value}
            onChangeText={onChange}
            keyboardType={keyboardType ?? 'default'}
            secureTextEntry={secureEntry && !visible}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#BDBDBD"
          />
        ) : (
          <Text style={[styles.campoValor, { color: theme.secondary }, bloqueado && styles.campoValorBloqueado]} numberOfLines={1}>
            {valorMostrado}
          </Text>
        )}
        {censurable && (
          <TouchableOpacity
            onPress={() => setVisible((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={visible ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#9E9E9E"
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.separador, { backgroundColor: theme.border }]} />
    </View>
  );
};

// ─── Pantalla principal ──────────────────────────────────────────────────────
export default function MiCuentaScreen({ navigation }) {
  const { theme, isDark } = useAppTheme();
  // En Avance 03: reemplazar con useAuthStore()
  // const usuarioInicial = {
  //   nombre: 'Juan Perez',
  //   avatar: null,
  //   correo: 'val********************com',
  //   contrasena: '******************',
  //   telefono: '1137567037',
  //   documento: '***************',
  //   idUsuario: 'q3tm894j',
  // };

  // ── CONEXIÓN BACKEND — perfil ─────────────────────────────────────────
  // Obtener datos reales del usuario desde authStore (guardados al hacer login)
  const user = useAuthStore((s) => s.user);

  // Estado inicial del form usando datos del store (mientras carga la API)
  const usuarioInicial = {
    nombre:     user?.name       ?? 'Usuario',
    avatar:     user?.avatarUrl  ?? null,
    correo:     user?.email      ?? '',
    contrasena: '••••••••••••••••',    // nunca se muestra la contraseña real
    passwordActual: '',
    nuevaPassword: '',
    telefono:   user?.telefono   ?? '',
    documento:  user?.documento  ?? '',
    idUsuario:  String(user?.id  ?? ''),
  };
  // ─────────────────────────────────────────────────────────────────────
  
  // @TASK: Mantiene la pantalla en carga hasta obtener el perfil autenticado.
  const [loadingPerfil, setLoadingPerfil] = useState(true);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...usuarioInicial });
  // @TASK: Conserva el último perfil obtenido para restaurarlo al cancelar la edición.
  const [formInicial, setFormInicial] = useState({ ...usuarioInicial });

  // @API: Obtiene el perfil real del usuario autenticado al montar la pantalla.
  useEffect(() => {
    // @TASK: Evita actualizar el estado si la pantalla se desmonta durante la petición.
    let activo = true;

    // @API: GET /api/users/me retorna los datos dentro de data.perfil.
    const cargarPerfil = async () => {
      try {
        const data = await api.get(ENDPOINTS.ME);
        const perfil = data?.perfil;

        if (!perfil || !activo) return;

        // @TASK: Adapta el contrato del backend a los campos usados por el formulario.
        const perfilForm = {
          nombre: perfil.nombre ?? '',
          avatar: perfil.foto ? `data:image/jpeg;base64,${perfil.foto}` : null,
          correo: perfil.email ?? '',
          contrasena: '••••••••••••••••',
          passwordActual: '',
          nuevaPassword: '',
          telefono: perfil.telefono ?? '',
          documento: perfil.documento ?? '',
          idUsuario: String(perfil.registroId ?? perfil.personaId ?? ''),
        };
        setForm(perfilForm);
        setFormInicial(perfilForm);
      } catch (error) {
        if (activo) {
          Alert.alert('Error', error?.response?.data?.message || 'No se pudo obtener tu perfil.');
        }
      } finally {
        if (activo) setLoadingPerfil(false);
      }
    };

    cargarPerfil();

    return () => {
      activo = false;
    };
  }, []);

  const set = (campo) => (valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const iniciales = form.nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleFAB = () => {
    if (!editing) {
      setEditing(true);
      return;
    }
    // Modo edición → confirmar cambios
    Alert.alert(
      'Confirmar cambios',
      '¿Querés guardar los cambios en tu cuenta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => {
            // @TASK: Restaura los datos reales cargados, sin conservar contraseñas ingresadas.
            setForm({ ...formInicial, passwordActual: '', nuevaPassword: '' });
            setEditing(false);
          },
        },
        {
          text: 'Guardar',
          onPress: () => {
            // // TODO Avance 03: authStore.updateUser(form) → PATCH /users/me
            // console.log('[MiCuenta] Guardar:', form);
            // setEditing(false);

            // ── CONEXIÓN BACKEND — guardar perfil ──────────────────────────
            // @API: PUT /api/users/me actualiza los campos que admite el backend.
            api.put(ENDPOINTS.ME, {
              nombre:   form.nombre,
              telefono: form.telefono,
              email:    form.correo,
              documento: form.documento,
              ...(form.nuevaPassword && {
                passwordActual: form.passwordActual,
                nuevaPassword: form.nuevaPassword,
              }),
            })
              .then(() => {
                // Perfil actualizado correctamente
                // @TASK: Actualiza el respaldo y elimina las contraseñas de memoria tras guardar.
                const formGuardado = { ...form, passwordActual: '', nuevaPassword: '' };
                setForm(formGuardado);
                setFormInicial(formGuardado);
                setEditing(false);
              })
              .catch((err) => {
                // Si falla el servidor mostrar error al usuario
                Alert.alert(
                  'Error',
                  err?.response?.data?.message || 'No se pudo guardar. Intentá de nuevo.'
                );
              });
            // ──────────────────────────────────────────────────────────────
          },
        },
      ]
    );
  };

  if (loadingPerfil) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.white }]}>
        {/* @TASK: Indica que el perfil real todavía se está cargando. */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B0000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.white }]}>
      {/* ── Top Bar ─────────────────────────────── */}
      <View style={[styles.topBar, { backgroundColor: theme.white, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: theme.secondary }]}>Mi cuenta</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Avatar ──────────────────────────────── */}
        <View style={styles.avatarWrapper}>
          {form.avatar ? (
            <Image source={{ uri: form.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarIniciales}>{iniciales}</Text>
            </View>
          )}
          {/* Botón cámara visible solo en modo edición */}
          {editing && (
            <TouchableOpacity
              style={styles.avatarEditBtn}
              onPress={() => console.log('[MiCuenta] Cambiar foto — integrar expo-image-picker')}
            >
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Nombre ──────────────────────────────── */}
        {editing ? (
          <TextInput
            style={styles.nombreInput}
            value={form.nombre}
            onChangeText={set('nombre')}
            autoCapitalize="words"
            autoCorrect={false}
          />
        ) : (
          <Text style={[styles.nombre, { color: theme.secondary }]}>{form.nombre}</Text>
        )}

        {/* ── Campos ──────────────────────────────── */}
        <View style={styles.camposContainer}>
          <Campo
            label="Correo electronico"
            value={form.correo}
            onChange={set('correo')}
            editing={editing}
            censurable={true}
            keyboardType="email-address"
          />
          <Campo
            label={editing ? 'Contraseña actual' : 'Contraseña'}
            value={editing ? form.passwordActual : form.contrasena}
            onChange={set('passwordActual')}
            editing={editing}
            censurable={true}
            secureEntry={true}
          />
          {editing && (
            <Campo
              // @TASK: Captura la nueva contraseña requerida por PUT /api/users/me.
              label="Nueva contraseña"
              value={form.nuevaPassword}
              onChange={set('nuevaPassword')}
              editing={true}
              censurable={true}
              secureEntry={true}
            />
          )}
          <Campo
            label="Numero de telefono"
            value={form.telefono}
            onChange={set('telefono')}
            editing={editing}
            censurable={false}
            keyboardType="phone-pad"
          />
          <Campo
            label="Documento de identificacion"
            value={form.documento}
            onChange={set('documento')}
            editing={editing}
            censurable={true}
            keyboardType="numeric"
          />
          {/* ID de usuario: nunca editable */}
          <Campo
            label="Id usuario"
            value={form.idUsuario}
            onChange={() => {}}
            editing={false}
            censurable={true}
            bloqueado={true}
          />
        </View>
      </ScrollView>

      {/* ── FAB: lápiz en vista, tilde en edición ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleFAB}
        activeOpacity={0.85}
      >
        <Ionicons
          name={editing ? 'checkmark' : 'pencil'}
          size={editing ? 26 : 22}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Top Bar
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0E8E0',
    elevation: 3,
    shadowColor: '#8b0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  backBtn:     { padding: 4 },
  topBarTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', letterSpacing: 0.3 },

  // Scroll
  scroll: {
    paddingBottom: 100,
    alignItems: 'center',
  },

  // Avatar
  avatarWrapper: {
    marginTop: 24,
    marginBottom: 12,
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIniciales: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // Nombre
  nombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 24,
  },
  nombreInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#8B0000',
    paddingBottom: 4,
    marginBottom: 24,
    minWidth: 160,
  },

  // Campos
  camposContainer: {
    width: '100%',
    paddingHorizontal: 24,
  },
  campoContainer: {
    marginBottom: 4,
  },
  campoLabel: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
    marginBottom: 4,
    marginTop: 12,
  },
  campoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  campoFilaActiva: {
    borderBottomWidth: 1,
    borderBottomColor: '#8B0000',
    paddingBottom: 2,
  },
  campoValor: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    marginRight: 8,
  },
  campoValorBloqueado: {
    color: '#9E9E9E',
  },
  campoInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    paddingVertical: 2,
    marginRight: 8,
  },
  separador: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
});
