import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const LOGO = require('../../assets/images/texto_appbar.jpeg');
const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────
// ESTRUCTURA DE DATOS QUE VIENE DE LA API
// Cada subasta del calendario:
// {
//   id:         string
//   titulo:     string
//   imagen:     string | null   → URL Cloudinary
//   moneda:     'ARS' | 'USD'
//   precioBase: number
//   fecha:      string          → 'YYYY-MM-DD'
//   hora:       string          → 'HH:mm'
// }
// ─────────────────────────────────────────────────────────────

const SUBASTAS_MOCK = [
  { id: '1', titulo: 'Cuadro de rosas',  imagen: null, moneda: 'USD', precioBase: 500,    fecha: '2025-09-04', hora: '15:00', colorPlaceholder: '#C9B99A' },
  { id: '2', titulo: 'Silla de oficina', imagen: null, moneda: 'ARS', precioBase: 85000,  fecha: '2025-09-09', hora: '18:00', colorPlaceholder: '#B0BEC5' },
  { id: '3', titulo: 'Lampara de pared', imagen: null, moneda: 'ARS', precioBase: 32000,  fecha: '2025-09-13', hora: '10:00', colorPlaceholder: '#A5C4A8' },
  { id: '4', titulo: 'Auto antiguo',     imagen: null, moneda: 'USD', precioBase: 12000,  fecha: '2025-09-13', hora: '20:00', colorPlaceholder: '#C4A58A' },
  { id: '5', titulo: 'Reloj de pared',   imagen: null, moneda: 'ARS', precioBase: 15000,  fecha: '2025-09-20', hora: '17:00', colorPlaceholder: '#D4B8C0' },
];

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEMANA = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export default function CalendarScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const hoy    = new Date();

  const [mes,  setMes]  = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  // Días con subastas en el mes actual
  const diasConSubasta = SUBASTAS_MOCK
    .filter(s => {
      const f = new Date(s.fecha);
      return f.getMonth() === mes && f.getFullYear() === anio;
    })
    .map(s => new Date(s.fecha).getDate());

  // Subastas del día seleccionado o todas del mes
  const subastasFiltradas = diaSeleccionado
    ? SUBASTAS_MOCK.filter(s => {
        const f = new Date(s.fecha);
        return f.getDate() === diaSeleccionado && f.getMonth() === mes && f.getFullYear() === anio;
      })
    : SUBASTAS_MOCK.filter(s => {
        const f = new Date(s.fecha);
        return f.getMonth() === mes && f.getFullYear() === anio;
      });

  const cambiarMes = (delta) => {
    let nuevoMes  = mes + delta;
    let nuevoAnio = anio;
    if (nuevoMes < 0)  { nuevoMes = 11; nuevoAnio--; }
    if (nuevoMes > 11) { nuevoMes = 0;  nuevoAnio++; }
    setMes(nuevoMes);
    setAnio(nuevoAnio);
    setDiaSeleccionado(null);
  };

  // Construir grilla del mes
  const primerDia    = new Date(anio, mes, 1).getDay();
  const diasEnMes    = new Date(anio, mes + 1, 0).getDate();
  const diasAntMes   = new Date(anio, mes, 0).getDate();
  const celdas       = [];

  for (let i = primerDia - 1; i >= 0; i--) {
    celdas.push({ dia: diasAntMes - i, esMesActual: false });
  }
  for (let d = 1; d <= diasEnMes; d++) {
    celdas.push({ dia: d, esMesActual: true });
  }
  const restantes = 7 - (celdas.length % 7);
  if (restantes < 7) {
    for (let d = 1; d <= restantes; d++) {
      celdas.push({ dia: d, esMesActual: false });
    }
  }

  const esHoy = (dia) =>
    dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear();

  const tieneSubasta = (dia) => diasConSubasta.includes(dia);

  const renderSubasta = ({ item }) => (
    <View style={styles.subastaCard}>
      {/* Imagen */}
      {item.imagen
        ? <Image source={{ uri: item.imagen }} style={styles.subastaImg} resizeMode="cover" />
        : <View style={[styles.subastaImg, { backgroundColor: item.colorPlaceholder }]} />
      }

      {/* Info */}
      <View style={styles.subastaInfo}>
        <Text style={styles.subastaTitulo} numberOfLines={1}>{item.titulo}</Text>
        <Text style={styles.subastaDetalle}>{item.moneda}  ${item.precioBase.toLocaleString()}</Text>
        <Text style={styles.subastaHora}>{item.hora}hs</Text>
      </View>

      {/* Botón Pujar → redirige al login */}
      <TouchableOpacity
        style={styles.btnPujar}
        onPress={() => navigation.navigate('Auth')}
        activeOpacity={0.85}
      >
        <Text style={styles.btnPujarText}>Pujar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('HomeUnauth')}>
          <Ionicons name="arrow-back" size={26} color="#1A1A1A" />
        </TouchableOpacity>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Calendario ── */}
        <View style={styles.calCard}>

          {/* Navegación mes */}
          <View style={styles.navRow}>
            <TouchableOpacity onPress={() => cambiarMes(-1)} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={20} color="#1A1A1A" />
            </TouchableOpacity>

            <Text style={styles.navMes}>{MESES[mes]}</Text>
            <Text style={styles.navAnio}>{anio}</Text>

            <TouchableOpacity onPress={() => cambiarMes(1)} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={20} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          {/* Cabecera días */}
          <View style={styles.semanaRow}>
            {DIAS_SEMANA.map(d => (
              <Text key={d} style={styles.diaSemana}>{d}</Text>
            ))}
          </View>

          {/* Grilla días */}
          <View style={styles.grilla}>
            {celdas.map((celda, i) => {
              const activo   = celda.esMesActual;
              const subasta  = activo && tieneSubasta(celda.dia);
              const hoyFlag  = activo && esHoy(celda.dia);
              const selec    = activo && diaSeleccionado === celda.dia;

              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.celdaDia,
                    subasta && styles.celdaConSubasta,
                    hoyFlag && !subasta && styles.celdaHoy,
                    selec    && styles.celdaSeleccionada,
                  ]}
                  onPress={() => activo && setDiaSeleccionado(selec ? null : celda.dia)}
                  disabled={!activo}
                >
                  <Text style={[
                    styles.celdaTexto,
                    !activo   && styles.textoApagado,
                    subasta   && styles.textoBlancoSubasta,
                    hoyFlag && !subasta && styles.textoHoy,
                    selec     && styles.textoBlanco,
                  ]}>
                    {celda.dia}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Lista subastas ── */}
        <Text style={styles.seccionTitulo}>
          {diaSeleccionado
            ? `Pujas del ${diaSeleccionado} de ${MESES[mes]}`
            : 'Pujas este mes'
          }
        </Text>

        {subastasFiltradas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={40} color="#E0E0E0" />
            <Text style={styles.emptyText}>No hay subastas para este día</Text>
          </View>
        ) : (
          subastasFiltradas.map(item => (
            <View key={item.id}>
              {renderSubasta({ item })}
            </View>
          ))
        )}

      </ScrollView>
    </View>
  );
}

const CELDA = (width - 24 - 24) / 7;

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 12, paddingBottom: 32 },

  // Top Bar
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 36, alignItems: 'flex-start' },
  logo:    { flex: 1, height: 32 },

  // Calendario
  calCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  navBtn:  { padding: 4 },
  navMes:  { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  navAnio: { fontSize: 16, fontWeight: '400', color: '#555555', marginLeft: 6 },

  semanaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  diaSemana: {
    width: CELDA,
    textAlign: 'center',
    fontSize: 12,
    color: '#888888',
    fontWeight: '600',
  },

  grilla: { flexDirection: 'row', flexWrap: 'wrap' },
  celdaDia: {
    width: CELDA,
    height: CELDA,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: CELDA / 2,
  },
  celdaConSubasta:   { backgroundColor: '#8b0000' },
  celdaHoy:          { backgroundColor: '#FFCDD2' },
  celdaSeleccionada: { backgroundColor: '#5a0000' },
  celdaTexto:        { fontSize: 13, fontWeight: '500', color: '#1A1A1A' },
  textoApagado:      { color: '#CCCCCC' },
  textoBlancoSubasta:{ color: '#FFFFFF', fontWeight: '700' },
  textoHoy:          { color: '#8b0000', fontWeight: '700' },
  textoBlanco:       { color: '#FFFFFF', fontWeight: '700' },

  // Sección subastas
  seccionTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
  },

  subastaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  subastaImg: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#CCCCCC',
  },
  subastaInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  subastaTitulo:  { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  subastaDetalle: { fontSize: 12, color: '#888888', marginTop: 2 },
  subastaHora:    { fontSize: 11, color: '#8b0000', marginTop: 2, fontWeight: '600' },

  btnPujar: {
    backgroundColor: '#8b0000',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  btnPujarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  emptyContainer: { alignItems: 'center', marginTop: 32 },
  emptyText:      { color: '#9E9E9E', fontSize: 14, marginTop: 10 },
});
