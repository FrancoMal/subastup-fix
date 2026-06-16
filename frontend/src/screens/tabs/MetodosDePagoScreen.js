import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// ─── Barra de navegación inferior ────────────────────────────────────────────
const BOTTOM_NAV_TABS = [
  { name: 'Main',           label: 'Inicio',   icon: 'home-outline' },
  { name: 'Mensajes',       label: 'Mensajes', icon: 'mail-outline' },
  { name: 'CargarProducto', label: 'Publicar', icon: 'add-circle-outline' },
  { name: 'PujarAuth',      label: 'Pujar',    icon: 'flag-outline' },
];

// ─── Mock de métodos de pago ──────────────────────────────────────────────────
// TODO BACKEND: reemplazar por llamada real a la API:
//   const { data } = await api.get(ENDPOINTS.PAYMENT_METHODS)
//   setMetodosPago(data)
const METODOS_PAGO_MOCK = [
  { id: '1', nombre: 'Metodo de pago 1' },
  { id: '2', nombre: 'Metodo de pago 2' },
  { id: '3', nombre: 'Metodo de pago 3' },
  { id: '4', nombre: 'Metodo de pago 4' },
];

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function MetodosDePagoScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  // ── Bottom nav handler ───────────────────────
  const handleBottomNav = (tabName) => {
    if (tabName === 'Main') {
      navigation.navigate('Main');
    } else if (tabName === 'Mensajes') {
      navigation.navigate('Mensajes');
    } else if (tabName === 'CargarProducto') {
      navigation.navigate('CargarProducto');
    } else if (tabName === 'PujarAuth') {
      navigation.navigate('PujarAuth');
    }
  };

    // ── Render cuando no hay elementos ─────────────
  const renderEfectoVacio = () => (
    <View style={styles.vacioContainer}>
      <Ionicons name="card-outline" size={48} color="#C0A898" style={{ marginBottom: 12 }} />
      <Text style={styles.vacioTexto}>No tenés métodos de pago registrados.</Text>
    </View>
  );

  // ── Render fila de método de pago ─────────────
  const renderMetodo = ({ item }) => (
    <TouchableOpacity
      style={styles.metodoItem}
      activeOpacity={0.7}
      onPress={() => {
        // TODO BACKEND: navegar al detalle/edición del método de pago
        // navigation.navigate('MetodoDePagoDetalle', { id: item.id })
      }}
    >
      <Text style={styles.metodoNombre}>{item.nombre}</Text>
      <Ionicons name="chevron-forward" size={22} color="#1A1A1A" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Header corregido (Sin Campana) ──────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#1a1a1a" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Metodos de pago</Text>

        {/* Añadimos un View vacío con el mismo ancho para centrar el título perfectamente */}
        <View style={{ width: 40 }} />
      </View>

      {/* ── Lista de métodos de pago ─────────────── */}
      <FlatList
        data={METODOS_PAGO_MOCK}
        keyExtractor={(item) => item.id}
        renderItem={renderMetodo}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        ListEmptyComponent={renderEfectoVacio}
      />

      {/* ── Botón Agregar ───────────────────────── */}
      <TouchableOpacity
        style={[styles.agregarBtn, { bottom: insets.bottom + 90 }]}
        activeOpacity={0.85}
        onPress={() => {
          // TODO BACKEND: navegar a la pantalla de agregar método de pago
          // navigation.navigate('AgregarMetodoDePago')
        }}
      >
        <Text style={styles.agregarBtnText}>Agregar</Text>
      </TouchableOpacity>

      {/* ══════════════════════════════════════════
          BARRA DE NAVEGACIÓN INFERIOR
       ══════════════════════════════════════════ */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
        {BOTTOM_NAV_TABS.map((tab, i) => {
          const isActive = false;
          return (
            <TouchableOpacity
              key={i}
              style={styles.tabItem}
              onPress={() => handleBottomNav(tab.name)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={26}
                color={isActive ? '#8b0000' : '#9E9E9E'}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

    </View>
  );
}

// ─── Estilos modificados ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  // Header corregido
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerIcon:  { padding: 4, width: 40 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },

  listContent: {
    paddingHorizontal: 16, 
    paddingTop: 20,
    paddingBottom: 160,
  },
  metodoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingVertical: 45,
    paddingHorizontal: 20,
    // Podés añadir opcionalmente un ancho porcentual si querés fijarlo exacto, 
    // pero disminuyendo el padding de listContent ya aprovecha al máximo el ancho de pantalla.
  },
  metodoNombre: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  // Espaciado incrementado entre las tarjetas
  itemSeparator: { height: 18 }, // Aumentado de 12 a 18 para mayor espacio

  // Botón agregar
  agregarBtn: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#8b0000',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    marginBottom: 5,
  },
  agregarBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Barra de navegación inferior
  bottomNav: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: '#FFF5EC',
    borderRadius: 30,
    paddingTop: 10,
    paddingHorizontal: 8,
    paddingBottom: 3,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '500',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#8b0000',
    fontWeight: '700',
  },
  // Estilo para el estado vacío
  vacioContainer: {
    marginTop: 150,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  vacioTexto: {
    fontSize: 15,
    color: '#9E9E9E',
    fontWeight: '500',
    textAlign: 'center',
  },
});