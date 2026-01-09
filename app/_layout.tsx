import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css'; // Keep import even if NativeWind is disabled, just in case

import { ClerkProvider, ClerkLoaded, useUser } from '@clerk/clerk-expo';
import { tokenCache } from '@/lib/auth';
import TrackingProvider, { useTracking } from '@/components/TrackingProvider';
import { useColorScheme } from 'react-native';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableEdgeToEdge } from 'react-native-safe-area-context';

// Enable edge-to-edge content (draw behind system bars)
// This is critical for transparent navigation bars on Android
enableEdgeToEdge();

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <TrackingProvider>
          <TrackingProvider>
            <SafeAreaProvider>
              <RootLayoutNav colorScheme={colorScheme} />
            </SafeAreaProvider>
          </TrackingProvider>
        </TrackingProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

function RootLayoutNav({ colorScheme }: { colorScheme: any }) {
  const { startTracking } = useTracking();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // Match System Navigation Bar to our App Theme
    // This removes the ugly gray block at the bottom
    import('expo-navigation-bar').then(NavigationBar => {
      NavigationBar.setBackgroundColorAsync('#050505');
      // NavigationBar.setButtonStyleAsync('light'); // Ensure buttons are visible on dark bg
    });

    if (isLoaded && user) {
      // Auto-start native tracking for residents
      const isRunner = user.publicMetadata?.role === 'RUNNER' || user.publicMetadata?.isRunner;
      if (!isRunner) {
        startTracking('EFFICIENT');
      }
    }
  }, [isLoaded, user]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ contentStyle: { backgroundColor: '#050505' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="vendor-terminal" options={{
          title: 'Vendor Terminal',
          headerStyle: { backgroundColor: '#050505' },
          headerTintColor: '#39FF14',
          headerTitleStyle: { fontWeight: '900' }
        }} />
        <Stack.Screen name="runner-operations" options={{
          title: 'Runner Terminal',
          headerStyle: { backgroundColor: '#050505' },
          headerTintColor: '#3498db',
          headerTitleStyle: { fontWeight: '900' }
        }} />
        <Stack.Screen name="profile-management" options={{
          title: 'Account Logistics',
          headerStyle: { backgroundColor: '#050505' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: '900' }
        }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
