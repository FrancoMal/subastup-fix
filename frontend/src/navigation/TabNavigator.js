import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

import HomeScreen     from '../screens/tabs/HomeScreen';
import SearchScreen   from '../screens/tabs/SearchScreen';
import CalendarScreen from '../screens/tabs/CalendarScreen';
import ChatsScreen    from '../screens/tabs/ChatsScreen';
import ProfileScreen  from '../screens/tabs/ProfileScreen';

const Tab = createBottomTabNavigator();

// Íconos simples con emoji hasta que tengamos los íconos reales
// (Después se reemplazan por react-native-vector-icons o expo/vector-icons)
const TabIcon = ({ emoji, label, focused }) => (
  <View style={styles.iconContainer}>
    <Text style={styles.emoji}>{emoji}</Text>
    <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
  </View>
);

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Inicio" focused={focused} /> }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="Buscar" focused={focused} /> }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📅" label="Agenda" focused={focused} /> }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💬" label="Chats" focused={focused} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Perfil" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 6,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  emoji: { fontSize: 20 },
  label: { fontSize: 10, color: COLORS.placeholder, marginTop: 2 },
  labelActive: { color: COLORS.primary, fontWeight: '600' },
});
