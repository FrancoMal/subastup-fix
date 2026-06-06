import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const LOGO        = require('../../assets/images/texto_appbar.jpeg');
const USER_AVATAR = require('../../assets/images/avatar.jpeg');

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;
const CARD_WIDTH   = (SCREEN_WIDTH - 16 * 2 - 12) / 2;
const CARD_HEIGHT  = CARD_WIDTH * 1.4;

// ─── Barra de navegación inferior ────────────────────────────────────────────
const BOTTOM_NAV_TABS = [
  { name: 'Home',     label: 'Inicio',   icon: 'home-outline' },
  { name: 'Search',   label: 'Mensajes', icon: 'mail-outline' },
  { name: 'Publicar', label: 'Publicar', icon: 'add-circle-outline' },
  { name: 'Chats',    label: 'Pujar',    icon: 'flag-outline' },
];

// ─── Mismos datos que HomeAuthenticatedScreen ────────────────────────────────
const DRAWER_GROUPS = [
  [
    { label: 'Mi cuenta',      icon: 'person-circle-outline', nav: 'MiCuenta' },
    { label: 'Configuracion',  icon: 'settings-outline',      nav: 'Configuracion' },
    { label: 'Ayuda',          icon: 'help-circle-outline',   nav: 'Ayuda' },
  ],
  [
    { label: 'Pujar',           icon: 'pricetag-outline',   nav: 'AuctionListAuth', navParams: { auctionType: 'comun' } },
    { label: 'Cargar producto', icon: 'add-square-outline', nav: null },
    { label: 'Mensajes',        icon: 'mail-outline',       nav: 'Search' },
  ],
  [
    { label: 'Cerrar sesion', icon: 'log-out-outline', nav: null, isLogout: true },
  ],
];

const NOTIFICATIONS = [];

// ─── Categorías y mock ───────────────────────────────────────────────────────
const CATEGORIAS = {
  especial: ['Oro', 'Platino'],
  comun:    ['Comun', 'Especial', 'Plata', 'Oro', 'Platino'],
};

const PRODUCTOS_MOCK = [
  { id: '1', titulo: 'Cuadro de rosas',  moneda: 'U$D', proximamente: false, color: '#C9B99A' },
  { id: '2', titulo: 'Silla de oficina', moneda: 'U$D', proximamente: true,  fecha: 'Martes 18, 15:00', color: '#B0BEC5' },
  { id: '3', titulo: 'Lampara de pared', moneda: 'AR$', proximamente: false, color: '#A5C4A8' },
  { id: '4', titulo: 'Auto antiguo',     moneda: 'AR$', proximamente: false, color: '#C4A58A' },
];

// ─── Pantalla ────────────────────────────────────────────────────────────────
export default function AuctionListAuthScreen({ navigation, route }) {
  const insets      = useSafeAreaInsets();
  const auctionType = route?.params?.auctionType ?? 'comun';
  const categorias  = CATEGORIAS[auctionType] ?? CATEGORIAS.comun;

  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(categorias[0]);

  // ── Drawer state ─────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const translateX     = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // ── Notif state ──────────────────────────────
  const [notifOpen,      setNotifOpen]      = useState(false);
  const [notifsExpanded, setNotifsExpanded] = useState(true);
  const [configExpanded, setConfigExpanded] = useState(false);
  const [darkTheme,      setDarkTheme]      = useState(true);
  const notifAnim    = useRef(new Animated.Value(0)).current;
  const notifOverlay = useRef(new Animated.Value(0)).current;

  // ── Drawer helpers ───────────────────────────
  const openMenu = () => {
    setMenuOpen(true);
    Animated.parallel([
      Animated.spring(translateX,     { toValue: 0, useNativeDriver: true, bounciness: 2, speed: 16 }),
      Animated.timing(overlayOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(translateX,     { toValue: -DRAWER_WIDTH, duration: 220, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0,             duration: 220, useNativeDriver: true }),
    ]).start(() => setMenuOpen(false));
  };

  const handleItemPress = (item) => {
    closeMenu();
    if (!item.nav) return;
    const TABS = ['Home', 'Search', 'Calendar', 'Chats', 'Profile'];
    if (TABS.includes(item.nav)) {
      navigation.navigate(item.nav);
    } else {
      navigation.navigate(item.nav, item.navParams);
    }
  };

  // ── Notif helpers ────────────────────────────
  const openNotif = () => {
    setNotifOpen(true);
    Animated.parallel([
      Animated.spring(notifAnim,    { toValue: 1, useNativeDriver: true, bounciness: 3, speed: 14 }),
      Animated.timing(notifOverlay, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  };

  const closeNotif = () => {
    Animated.parallel([
      Animated.timing(notifAnim,    { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(notifOverlay, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setNotifOpen(false));
  };

  const panelTranslateY = notifAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });
  const panelScale      = notifAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
  const panelOpacity    = notifAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  // ── Bottom nav handler ───────────────────────
  const handleBottomNav = (tabName) => {
    if (tabName === 'Home') {
      navigation.navigate('Home');
    } else if (tabName === 'Search') {
      navigation.navigate('Search');
    } else if (tabName === 'Publicar') {
      navigation.navigate('Publicar');
    } else if (tabName === 'Chats') {
      // Ya estamos en la pantalla de pujar, no hacemos nada
    }
  };

  // ── Cards ────────────────────────────────────
  const productosFiltrados = PRODUCTOS_MOCK.filter(() => true);

  const renderCard = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.card, index % 2 === 0 ? { marginRight: 6 } : { marginLeft: 6 }]}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('AuctionDetailAuth', { productId: item.id })}
    >
      <View style={[styles.cardImage, { backgroundColor: item.color }]} />

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.moneda}</Text>
      </View>

      {item.proximamente && (
        <View style={styles.proximamenteOverlay}>
          <Ionicons name="notifications-outline" size={22} color="#1A1A1A" />
          <Text style={styles.proximamenteTitulo}>Proximamente</Text>
          <Text style={styles.proximamenteFecha}>{item.fecha}</Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.cardTitulo} numberOfLines={1}>{item.titulo}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Header autenticado ───────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={openMenu}>
          <Ionicons name="menu" size={28} color="#1a1a1a" />
        </TouchableOpacity>

        <Image source={LOGO} style={styles.logo} resizeMode="contain" />

        <TouchableOpacity style={styles.headerIcon} onPress={openNotif}>
          <Ionicons name="notifications-outline" size={26} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      {/* ── Búsqueda y chips FIJOS ───────────────── */}
      <View style={styles.fixedHeader}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9E9E9E" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar"
            placeholderTextColor="#9E9E9E"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, selected === cat && styles.chipSelected]}
              onPress={() => setSelected(cat)}
            >
              <Text style={[styles.chipText, selected === cat && styles.chipTextSelected]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Grid ────────────────────────────────── */}
      <FlatList
        data={productosFiltrados}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* ══════════════════════════════════════════
          BARRA DE NAVEGACIÓN INFERIOR
      ══════════════════════════════════════════ */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
        {BOTTOM_NAV_TABS.map((tab, i) => {
          // "Pujar" (Chats) está activo porque estamos en esta pantalla
          const isActive = tab.name === 'Chats';
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

      {/* ══════════════════════════════════════════
          OVERLAY + PANEL DE NOTIFICACIONES
      ══════════════════════════════════════════ */}
      {notifOpen && (
        <>
          <TouchableWithoutFeedback onPress={closeNotif}>
            <Animated.View style={[styles.overlay, { opacity: notifOverlay }]} />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.notifPanel,
              {
                top: insets.top + 56,
                opacity:   panelOpacity,
                transform: [{ translateY: panelTranslateY }, { scale: panelScale }],
              },
            ]}
          >
            {/* Notificaciones */}
            <TouchableOpacity
              style={styles.notifSectionHeader}
              onPress={() => setNotifsExpanded(v => !v)}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={20} color="#1a1a1a" style={{ marginRight: 8 }} />
              <Text style={styles.notifSectionTitle}>Notificaciones</Text>
              <Ionicons name={notifsExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#1a1a1a" />
            </TouchableOpacity>

            {notifsExpanded && (
              <View style={styles.notifContent}>
                {NOTIFICATIONS.length === 0 ? (
                  <Text style={styles.notifEmpty}>{'<<No hay notificaciones>>'}</Text>
                ) : (
                  NOTIFICATIONS.map((n, i) => <Text key={i} style={styles.notifItem}>{n}</Text>)
                )}
              </View>
            )}

            <View style={styles.notifDivider} />

            {/* Configuracion */}
            <TouchableOpacity
              style={styles.notifSectionHeader}
              onPress={() => setConfigExpanded(v => !v)}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={20} color="#1a1a1a" style={{ marginRight: 8 }} />
              <Text style={styles.notifSectionTitle}>Configuracion</Text>
              <Ionicons name={configExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#1a1a1a" />
            </TouchableOpacity>

            {configExpanded && (
              <View style={styles.configContent}>
                <View style={styles.themeRow}>
                  <Ionicons name="moon-outline" size={20} color="#1a1a1a" style={{ marginRight: 10 }} />
                  <Text style={styles.themeLabel}>Tema</Text>
                  <Switch
                    value={darkTheme}
                    onValueChange={setDarkTheme}
                    thumbColor="#FFFFFF"
                    trackColor={{ false: '#C0B0A8', true: '#8b0000' }}
                    style={{ marginLeft: 'auto' }}
                  />
                </View>
              </View>
            )}
          </Animated.View>
        </>
      )}

      {/* ══════════════════════════════════════════
          OVERLAY + DRAWER HAMBURGUESA
      ══════════════════════════════════════════ */}
      {menuOpen && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View
        style={[
          styles.drawer,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 16,
            transform: [{ translateX }],
          },
        ]}
      >
        <TouchableOpacity style={styles.closeBtn} onPress={closeMenu}>
          <Ionicons name="chevron-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>

        <View style={styles.profileSection}>
          <Image source={USER_AVATAR} style={styles.avatar} />
          <Text style={styles.userName}>Nombre del usuario</Text>
        </View>

        <ScrollView style={styles.drawerScroll} showsVerticalScrollIndicator={false}>
          {DRAWER_GROUPS.map((group, gi) => (
            <View key={gi}>
              {gi > 0 && <View style={styles.separator} />}
              {group.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={styles.drawerItem}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={0.6}
                >
                  <Ionicons name={item.icon} size={22} color="#1a1a1a" style={styles.drawerItemIcon} />
                  <Text style={styles.drawerItemLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      </Animated.View>

    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
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
    borderBottomColor: '#F0F0F0',
  },
  headerIcon: { padding: 4, width: 40 },
  logo:       { width: '45%', height: 32, alignSelf: 'center' },

  // Búsqueda y chips
  fixedHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginTop: 16,
    marginBottom: 12,
  },
  searchIcon:  { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#1A1A1A' },

  chipsScroll:      { marginBottom: 8 },
  chipsContent:     { gap: 8, paddingRight: 8 },
  chip: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#8b0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected:     { backgroundColor: '#8b0000' },
  chipText:         { fontSize: 14, color: '#8b0000', fontWeight: '600' },
  chipTextSelected: { color: '#FFFFFF' },

  // Grid
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    backgroundColor: '#F5F5F5',
  },
  cardImage: { width: '100%', height: '100%', position: 'absolute' },
  badge: {
    position: 'absolute',
    top: 8, right: 8,
    backgroundColor: '#FFFFFFCC',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },
  proximamenteOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffffcc',
  },
  proximamenteTitulo: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginTop: 4 },
  proximamenteFecha:  { fontSize: 11, color: '#555555', marginTop: 2 },
  cardFooter: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 40,
    backgroundColor: '#8b0000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  cardTitulo: { fontSize: 13, color: '#FFFFFF', fontWeight: '600', textAlign: 'center' },

  // Overlay compartido
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 10,
  },

  // Panel notificaciones
  notifPanel: {
    position: 'absolute',
    right: 12,
    width: SCREEN_WIDTH - 48,
    backgroundColor: '#FFF5EC',
    borderRadius: 16,
    zIndex: 30,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    overflow: 'hidden',
  },
  notifSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  notifSectionTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  notifContent: {
    backgroundColor: '#F5E8DC',
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 10,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  notifEmpty: { fontSize: 13, color: '#888', fontStyle: 'italic' },
  notifItem:  { fontSize: 14, color: '#1a1a1a', paddingVertical: 4 },
  notifDivider: {
    height: 1,
    backgroundColor: '#E8D5C8',
    marginHorizontal: 14,
    marginBottom: 4,
  },
  configContent: { paddingHorizontal: 18, paddingBottom: 16 },
  themeRow:      { flexDirection: 'row', alignItems: 'center' },
  themeLabel:    { fontSize: 15, fontWeight: '500', color: '#1a1a1a' },

  // Drawer
  drawer: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFF5EC',
    zIndex: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  closeBtn: { alignSelf: 'flex-end', marginRight: 16, marginBottom: 8, padding: 4 },
  profileSection: { paddingHorizontal: 24, paddingBottom: 20 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    marginBottom: 12,
    borderWidth: 2.5,
    borderColor: '#D4A598',
    backgroundColor: '#F0D8CC',
  },
  userName:       { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  drawerScroll:   { flex: 1 },
  separator: {
    height: 1,
    backgroundColor: '#E8D5C8',
    marginHorizontal: 24,
    marginVertical: 6,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
  drawerItemIcon:  { marginRight: 18, width: 24 },
  drawerItemLabel: { fontSize: 16, fontWeight: '500', color: '#1a1a1a' },

  // ── Barra de navegación inferior ─────────────
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
});
