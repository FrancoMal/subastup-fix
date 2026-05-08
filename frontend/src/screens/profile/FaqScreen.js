import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function FaqScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FaqScreen</Text>
      <Text style={styles.subtitle}>Pantalla en construcción 🚧</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  title:     { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  subtitle:  { fontSize: 14, color: COLORS.placeholder, marginTop: 8 },
});
