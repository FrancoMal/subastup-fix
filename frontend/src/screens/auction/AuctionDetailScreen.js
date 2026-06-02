import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const LOGO  = require('../../assets/images/texto_appbar.jpeg');
const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────
// ESTRUCTURA DE DATOS QUE VIENE DE LA API
// {
//   id:          string
//   titulo:      string
//   descripcion: string
//   imagenes:    string[]   → array de URLs (Cloudinary)
//   moneda:      'ARS' | 'USD'
//   precioBase:  number
//   categoria:   string
//   estado:      'activo' | 'proximamente' | 'finalizado'
// }
// ─────────────────────────────────────────────────────────────

// MOCK — se reemplaza con api.get(ENDPOINTS.AUCTION_BY_ID(productId))
const PRODUCTO_MOCK = {
  id: 'ART-00142',
  titulo: 'Cuadro de rosas',
  descripcion: 'Hermoso cuadro pintado a mano con técnica al óleo. Dimensiones 80x60cm. Firmado por el artista. En excelente estado de conservación.',
  imagenes: [null, null, null], // null = placeholder; con API serán URLs
  moneda: 'USD',
  precioBase: 500,
  categoria: 'oro',
  estado: 'activo',
  coloresPlaceholder: ['#C9B99A', '#B0BEC5', '#A5C4A8'],
};

export default function AuctionDetailScreen({ navigation, route }) {
  const insets    = useSafeAreaInsets();
  const productId = route?.params?.productId;
  const producto  = PRODUCTO_MOCK; // ← reemplazar con fetch por productId

  const [activeSlide, setActiveSlide] = useState(0);

  const onSlideChange = (e) => {
    const slide = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveSlide(slide);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#1A1A1A" />
        </TouchableOpacity>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <View style={styles.backBtn} />
      </View>

      {/* ── Contenido scrolleable ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Carrusel de imágenes */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={producto.imagenes}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onSlideChange}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => (
              item ? (
                <Image
                  source={{ uri: item }}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.carouselImage, { backgroundColor: producto.coloresPlaceholder[index % 3] }]} />
              )
            )}
          />

          {/* Dots indicadores */}
          <View style={styles.dotsRow}>
            {producto.imagenes.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeSlide && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Nombre */}
        <Text style={styles.titulo}>{producto.titulo}</Text>

        {/* ID */}
        <Text style={styles.idText}>ID: {producto.id}</Text>

        {/* Descripción */}
        <Text style={styles.descLabel}>Descripcion</Text>
        <View style={styles.separator} />
        <Text style={styles.descTexto}>{producto.descripcion}</Text>

        {/* Bloque inferior: no puede pujar + login */}
        <View style={styles.actionsContainer}>

          {/* Cartel gris deshabilitado */}
          <View style={styles.btnNoPuede}>
            <Text style={styles.btnNoPuedeText}>No puede participar{'\n'}de la puja</Text>
          </View>

          {/* Botón Iniciar sesión */}
          <TouchableOpacity
            style={styles.btnLogin}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Auth')}
          >
            <Ionicons name="log-in-outline" size={32} color="#FFFFFF" style={styles.btnLoginIcon} />
            <Text style={styles.btnLoginText}>Iniciar sesion</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  // Top Bar
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 36, alignItems: 'flex-start' },
  logo:    { flex: 1, height: 32 },

  // Scroll
  scrollContent: { paddingBottom: 40 },

  // Carrusel
  carouselContainer: { 
    marginBottom: 20, 
    marginTop: 15,
  },
  carouselImage: {
    width,
    height: 260,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
  },
  dotActive: { backgroundColor: '#8b0000', width: 20 },

  // Texto
  titulo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'monospace',
    marginBottom: 4,
    paddingHorizontal: 24,
  },
  idText: {
    fontSize: 13,
    color: '#555555',
    fontFamily: 'monospace',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  descLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'monospace',
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  separator: {
    height: 1.5,
    backgroundColor: '#BBBBBB',
    marginHorizontal: 24,
    marginBottom: 10,
  },
  descTexto: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 22,
    paddingHorizontal: 24,
    marginBottom: 32,
  },

  // Acciones
  actionsContainer: { paddingHorizontal: 24, gap: 12 },

  btnNoPuede: {
    height: 100,
    backgroundColor: '#6e6e6e',
    justifyContent: 'center',
    alignItems: 'center',
    width: '200%',
    alignSelf: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  btnNoPuedeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },

  btnLogin: {
    height: 58,
    backgroundColor: '#8b0000',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    width: '90%',
    alignSelf: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  btnLoginIcon: { marginRight: 8 },
  btnLoginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
