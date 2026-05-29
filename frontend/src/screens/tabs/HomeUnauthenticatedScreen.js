import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO             = require('../../assets/images/texto_appbar.jpeg');
const IMG_PLACEHOLDER1 = require('../../assets/images/imagen_menu1.jpeg');
const IMG_PLACEHOLDER2 = require('../../assets/images/imagen_menu2.jpeg');
const BTN_CALENDARIO   = require('../../assets/images/btn_calendario.jpeg');
const BTN_LOGIN        = require('../../assets/images/btn_login.jpeg');
const BTN_REGISTER     = require('../../assets/images/btn_register.jpeg');

export default function HomeUnauthenticatedScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      <View style={styles.headerContainer}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Subastas Especiales</Text>
        <View style={styles.auctionContainer}>
          <Image source={IMG_PLACEHOLDER1} style={styles.auctionImage} resizeMode="cover" />
          <TouchableOpacity
            style={styles.verMasButton}
            onPress={() => navigation.navigate('AuctionList', { auctionType: 'especial' })}
          >
            <Text style={styles.verMasText}>Ver mas</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Subastas Comunes</Text>
        <View style={styles.auctionContainer}>
          <Image source={IMG_PLACEHOLDER2} style={styles.auctionImage} resizeMode="cover" />
          <TouchableOpacity
            style={styles.verMasButton}
            onPress={() => navigation.navigate('AuctionList', { auctionType: 'comun' })}
          >
            <Text style={styles.verMasText}>Ver mas</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 65 }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Auth')}
        >
          <Image source={BTN_LOGIN} style={styles.navIconSmall} />
          <Text style={styles.navLabel}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItemCenter}
          onPress={() => console.log('Ver calendario')}
        >
          <Image source={BTN_CALENDARIO} style={styles.navIconLarge} />
          <Text style={styles.navLabel}>Calendario</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
        >
          <Image source={BTN_REGISTER} style={styles.navIconSmall} />
          <Text style={styles.navLabel}>Registrarse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer:  { alignItems: 'center', paddingTop: 12, paddingBottom: 8, backgroundColor: '#FFFFFF' },
  logo:             { width: '55%', height: 36 },
  scroll:           { flex: 1 },
  scrollContent:    { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 },
  sectionTitle:     { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginTop: 30, marginBottom: 10 },
  auctionContainer: { position: 'relative', height: 190, borderRadius: 12, overflow: 'hidden', marginBottom: 4 },
  auctionImage:     { width: '100%', height: '100%' },
  verMasButton:     { position: 'absolute', bottom: 14, right: 14, paddingHorizontal: 18, paddingVertical: 8, backgroundColor: '#8b0000', borderRadius: 8 },
  verMasText:       { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  bottomNav:        { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 10, paddingHorizontal: 24 },
  navItem:          { alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  navItemCenter:    { alignItems: 'center', justifyContent: 'flex-end', flex: 1, marginBottom: -4 },
  navIconSmall:     { width: 80, height: 80, resizeMode: 'contain', borderRadius: 16, overflow: 'hidden' },
  navIconLarge:     { width: 100, height: 100, resizeMode: 'contain', borderRadius: 20, overflow: 'hidden' },
  navLabel:         { fontSize: 11, color: '#1a1a1a', fontWeight: '600', marginTop: 4, textAlign: 'center' },
});