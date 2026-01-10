import 'react-native-reanimated';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import '../global.css'; // Keep import even if NativeWind is disabled, just in case

import { ClerkProvider, ClerkLoaded, useUser } from '@clerk/clerk-expo';
import { tokenCache } from '@/lib/auth';
import TrackingProvider, { useTracking } from '@/components/TrackingProvider';
import { useColorScheme, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableEdgeToEdge } from 'react-native-safe-area-context';
import { usePathname, useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Enable edge-to-edge content (draw behind system bars)
// This is critical for transparent navigation bars on Android
try {
  if (Platform.OS === 'android' && enableEdgeToEdge) {
    enableEdgeToEdge();
  }
} catch (e) {
  console.warn('Edge-to-edge failed:', e);
}

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
          <SafeAreaProvider>
            <RootLayoutNav colorScheme={colorScheme} />
          </SafeAreaProvider>
        </TrackingProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

function RootLayoutNav({ colorScheme }: { colorScheme: any }) {
  const { startTracking } = useTracking();
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const segments = useSegments();

  // Save Navigation State
  useEffect(() => {
    if (pathname && pathname !== '/') {
      SecureStore.setItemAsync('NAVIGATION_STATE', pathname).catch(() => { });
    }
  }, [pathname]);

  // Restore Navigation State
  useEffect(() => {
    const restore = async () => {
      if (segments.length === 0) {
        const saved = await SecureStore.getItemAsync('NAVIGATION_STATE').catch(() => null);
        if (saved && saved !== '/') {
          console.log('Restoring Navigation State:', saved);
          router.replace(saved as any);
        }
      }
    };
    restore();
  }, [isLoaded]); // Run when loaded

  const isDark = colorScheme === 'dark';

  // Dynamic Theme Colors
  const bgColor = isDark ? '#050505' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const headerBg = isDark ? '#050505' : '#F5F5F7';

  // Omni Green / Omni Blue
  const accentColor = '#39FF14';
  const runnerColor = '#3498db';

  useEffect(() => {
    // Match System Navigation Bar to our App Theme
    import('expo-navigation-bar').then(NavigationBar => {
      NavigationBar.setBackgroundColorAsync(bgColor);
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
    });

    if (isLoaded && user) {
      // Auto-start native tracking for residents
      const isRunner = user.publicMetadata?.role === 'RUNNER' || user.publicMetadata?.isRunner;
      if (!isRunner) {
        startTracking('EFFICIENT');
      }
    }
  }, [isLoaded, user, isDark, bgColor]);

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ contentStyle: { backgroundColor: bgColor } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        <Stack.Screen name="vendor-terminal" options={{
          title: 'Vendor Terminal',
          headerStyle: { backgroundColor: headerBg },
          headerTintColor: accentColor,
          headerTitleStyle: { fontWeight: '900' }
        }} />

        <Stack.Screen name="runner-operations" options={{
          title: 'Runner Terminal',
          headerStyle: { backgroundColor: headerBg },
          headerTintColor: runnerColor,
          headerTitleStyle: { fontWeight: '900' }
        }} />

        <Stack.Screen name="profile-management" options={{
          title: 'Account Logistics',
          headerStyle: { backgroundColor: headerBg },
          headerTintColor: textColor,
          headerTitleStyle: { fontWeight: '900' }
        }} />

        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </ThemeProvider>
  );
}
