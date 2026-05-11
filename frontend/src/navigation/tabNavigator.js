import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

import HomeScreen     from '../screens/tabs/HomeScreen';
import SearchScreen   from '../screens/tabs/SearchScreen';
import CalendarScreen from '../screens/tabs/CalendarScreen';
import ChatsScreen    from '../screens/tabs/ChatsScreen';
import ProfileScreen  from '../screens/tabs/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.placeholder,
        tabBarStyle: { backgroundColor: COLORS.white, borderTopColor: COLORS.border, height: 60, paddingBottom: 8, paddingTop: 4 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home:     focused ? 'home'        : 'home-outline',
            Search:   focused ? 'search'      : 'search-outline',
            Calendar: focused ? 'calendar'    : 'calendar-outline',
            Chats:    focused ? 'chatbubbles' : 'chatbubbles-outline',
            Profile:  focused ? 'person'      : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}     options={{ tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="Search"   component={SearchScreen}   options={{ tabBarLabel: 'Buscar' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarLabel: 'Agenda' }} />
      <Tab.Screen name="Chats"    component={ChatsScreen}    options={{ tabBarLabel: 'Chats' }} />
      <Tab.Screen name="Profile"  component={ProfileScreen}  options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}