import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import NativeTicker from '@/components/NativeTicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  // Dynamic Theme Colors
  const bgColor = isDark ? '#050505' : '#FFFFFF';
  const activeColor = isDark ? '#39FF14' : '#000000'; // Neon Green or Black
  const inactiveColor = isDark ? '#666666' : '#999999';
  const borderColor = isDark ? 'rgba(57, 255, 20, 0.15)' : 'rgba(0,0,0,0.05)';

  return (
    <>
      <NativeTicker />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 4,
          },
          tabBarStyle: {
            // Robust Safe Area Implementation
            position: 'relative', // No longer absolute (fixes overlap)
            backgroundColor: bgColor,
            borderTopWidth: 1,
            borderColor: borderColor,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 8,
            elevation: 0, // Flat look
            shadowOpacity: 0, // Remove shadow for robust look
          },
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Shop',
            tabBarIcon: ({ color }) => <FontAwesome5 name="store" size={20} color={color} />,
          }}
        />
        <Tabs.Screen
          name="pulse"
          options={{
            title: 'Pulse',
            tabBarIcon: ({ color }) => <FontAwesome5 name="bolt" size={20} color={color} />,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color }) => <FontAwesome5 name="box" size={20} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Account',
            tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={20} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
