import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import NativeTicker from '@/components/NativeTicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeColor = '#39FF14';
  const inactiveColor = '#666';
  const bgColor = '#050505';

  const insets = useSafeAreaInsets();

  // Aggressive clearance for system buttons (Back/Home/Recent)
  // We'll lift the bar off the floor entirely to create a 'Floating Island'
  const isButtonNav = insets.bottom === 0;
  const bottomMargin = isButtonNav ? 20 : insets.bottom;
  const tabHeight = 70;

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
            marginBottom: 10,
          },
          tabBarStyle: {
            backgroundColor: 'rgba(10, 10, 10, 0.95)', // Deep dark, nearly opaque
            borderWidth: 1,
            borderTopWidth: 1, // Consistent border
            borderColor: 'rgba(57, 255, 20, 0.15)', // Subtle Omni Green glow
            height: 70, // Standard height
            position: 'absolute',
            bottom: bottomMargin + 12, // Professional floating gap
            left: 16,
            right: 16,
            elevation: 8,
            borderRadius: 35, // Smooth pill shape
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            paddingTop: 8, // Center icons vertically
            paddingBottom: Platform.OS === 'ios' ? 0 : 8, // Adjust for iOS pill vs Android
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
