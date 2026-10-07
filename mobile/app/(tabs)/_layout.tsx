import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Home, Compass, ShoppingBag, User, Briefcase, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { normalizeRole, isProRole } from '../../src/constants/roles';

import { useTheme } from '../../src/contexts/ThemeContext';
import Colors from '../../constants/Colors';

export default function TabLayout() {
  const { colorScheme } = useTheme();
  const theme = Colors[colorScheme];
  const { user } = useAuth();
  const role = normalizeRole(user?.role_name);
  // La 5.ª pestaña solo existe para quien tiene herramientas (profesionales y admin). Los dueños de mascota ven 4 pestañas;
  // su cuenta/ayuda/alta profesional viven en Perfil.
  const showTools = isProRole(role) || role === 'admin';
  const ToolsIcon = role === 'admin' ? ShieldCheck : Briefcase;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.3,
        },
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTitleStyle: {
          color: theme.text,
          fontWeight: '800',
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <Home size={focused ? 26 : 22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="explorar"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, focused }) => (
            <Compass size={focused ? 26 : 22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="tienda-tab"
        options={{
          title: 'Michi-Shop',
          tabBarIcon: ({ color, focused }) => (
            <ShoppingBag size={focused ? 26 : 22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <User size={focused ? 26 : 22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: role === 'admin' ? 'Admin' : 'Herramientas',
          href: showTools ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <ToolsIcon size={focused ? 26 : 22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
