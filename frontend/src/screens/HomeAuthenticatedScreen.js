import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const LOGO             = require('../assets/images/texto_appbar.jpeg');
const IMG_PLACEHOLDER1 = require('../assets/images/imagen_menu1.jpeg');
const IMG_PLACEHOLDER2 = require('../assets/images/imagen_menu2.jpeg');

const MENU_BUTTONS = [
  { label: 'Metodos de Pago', icon: 'card-outline',          onPress: () => console.log('Metodos de Pago') },
  { label: 'Informacion',     icon: 'information-circle-outline', onPress: () => console.log('Informacion') },
  { label: 'Calendario',      icon: 'calendar-outline',      onPress: () => console.log('Calendario') },
];

const BOTTOM_TABS = [
  { label: 'Inicio',    icon: 'home-outline' },
  { label: 'Mensajes',  icon: 'mail-outline' },
  { label: 'Publicar',  icon: 'add-circle-outline' },
  { label: 'Pujar',     icon: 'flag-outline' },
];

export default function HomeAuthenticatedScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Header ──────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => console.log('Menu')}>
          <Ionicons name="menu" size={28} color="#1a1a1a" />
        </TouchableOpacity>

        <Image source={LOGO} style={styles.logo} resizeMode="contain" />

        <TouchableOpacity style={styles.headerIcon} onPress={() => console.log('Notificaciones')}>
          <Ionicons name="notifications-outline" size={26} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      {/* ── Contenido scrolleable ────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Subastas Especiales */}
        <Text style={styles.sectionTitle}>Subastas Especiales</Text>
        <View style={styles.auctionContainer}>
          <Image source={IMG_PLACEHOLDER1} style={styles.auctionImage} resizeMode="cover" />
          <TouchableOpacity style={styles.verMasButton}>
            <Text style={styles.verMasText}>Ver mas</Text>
          </TouchableOpacity>
        </View>

        {/* Subastas Comunes */}
        <Text style={styles.sectionTitle}>Subastas Comunes</Text>
        <View style={styles.auctionContainer}>
          <Image source={IMG_PLACEHOLDER2} style={styles.auctionImage} resizeMode="cover" />
          <TouchableOpacity style={styles.verMasButton}>
            <Text style={styles.verMasText}>Ver mas</Text>
          </TouchableOpacity>
        </View>

        {/* ── Botones del menú ──────────────────── */}
        <View style={styles.menuButtonsRow}>
          {MENU_BUTTONS.map((btn, i) => (
            <TouchableOpacity key={i} style={styles.menuButton} onPress={btn.onPress}>
              <Ionicons name={btn.icon} size={32} color="#FFFFFF" />
              <Text style={styles.menuButtonLabel}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* ── Bottom tab bar ────────────────────────── */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
        {BOTTOM_TABS.map((tab, i) => (
          <TouchableOpacity
            key={i}
            style={styles.tabItem}
            onPress={() => setActiveTab(i)}
          >
            <Ionicons
              name={tab.icon}
              size={26}
              color={activeTab === i ? '#8b0000' : '#9E9E9E'}
            />
            <Text style={[styles.tabLabel, activeTab === i && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  // Header
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
  headerIcon: { padding: 4, width: 40 },
  logo:       { width: '45%', height: 32, alignSelf: 'center' },

  // Scroll
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 },

  // Secciones
  sectionTitle: {
    fontSize: 20, fontWeight: '800', color: '#1a1a1a',
    marginTop: 20, marginBottom: 10,
  },
  auctionContainer: {
    position: 'relative', height: 190,
    borderRadius: 12, overflow: 'hidden', marginBottom: 4,
  },
  auctionImage:  { width: '100%', height: '100%' },
  verMasButton:  {
    position: 'absolute', bottom: 14, right: 14,
    paddingHorizontal: 18, paddingVertical: 8,
    backgroundColor: '#8b0000', borderRadius: 8,
  },
  verMasText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },

  // Botones del menú (3 iguales)
  menuButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 10,
  },
  menuButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#8b0000',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  menuButtonLabel: {
    color: '#FFFFFF', fontSize: 11, fontWeight: '600',
    textAlign: 'center', marginTop: 6,
  },

  // Bottom tab bar
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFF5EC',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11, color: '#9E9E9E',
    fontWeight: '500', marginTop: 3,
  },
  tabLabelActive: {
    color: '#8b0000', fontWeight: '700',
  },
});
