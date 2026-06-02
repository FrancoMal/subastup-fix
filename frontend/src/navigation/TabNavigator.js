import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen          from '../screens/tabs/HomeAuthenticatedScreen';
import ChatsScreen         from '../screens/chat/ChatsScreen';
import CargarProductoScreen from '../screens/auction/CargarProductoScreen';
import ProfileScreen       from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  const TABS_CONFIG = [
    { name: 'Home',     label: 'Inicio',   icon: 'home-outline' },
    { name: 'Search',   label: 'Mensajes', icon: 'mail-outline' },
    { name: 'Publicar', label: 'Publicar', icon: 'add-circle-outline' },
    { name: 'Chats',    label: 'Pujar',    icon: 'flag-outline' },
    { name: 'Profile',  label: 'Perfil',   icon: 'person-outline' },
  ];

  const activeRoute = state.routes[state.index];
  if (activeRoute.name === 'Publicar') return null;

  return (
    <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
      {state.routes.map((route, i) => {
        const isFocused = state.index === i;
        const tabConfig = TABS_CONFIG.find(t => t.name === route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            preventDefault: () => {},
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={i}
            style={styles.tabItem}
            onPress={onPress}
          >
            <Ionicons
              name={tabConfig?.icon || 'help-outline'}
              size={26}
              color={isFocused ? '#8b0000' : '#9E9E9E'}
            />
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {tabConfig?.label || route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Search"   component={ChatsScreen} />
      <Tab.Screen name="Publicar" component={CargarProductoScreen} options={{ tabBarStyle: { display: 'none' } }} />
      <Tab.Screen name="Chats"    component={ChatsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: '#FFF5EC',
    borderTopWidth: 0,
    borderRadius: 30,
    paddingTop: 10,
    paddingHorizontal: 8,
    paddingBottom: 3,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
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
