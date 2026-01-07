import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Radar from 'react-native-radar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, useSession } from '@clerk/clerk-expo';

interface WebViewScreenProps {
    routePath: string;
}

export default function WebViewScreen({ routePath }: WebViewScreenProps) {
    const router = useRouter();
    const { isLoaded: authLoaded, userId } = useAuth();
    const { session } = useSession();
    const [uri, setUri] = React.useState('');
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://omni-lilac.vercel.app';

    useEffect(() => {
        const prepareUri = async () => {
            if (session) {
                const token = await session.getToken();

                // Define routes that require a session sync
                const protectedRoutes = ['/dashboard', '/runner', '/uplink/profile', '/orders', '/marketplace', '/stories'];
                const isProtected = protectedRoutes.some(route => routePath.startsWith(route));

                if (isProtected) {
                    // Route through the Hybrid Sync Engine to auto-login on web
                    const syncUrl = `${apiUrl}/api/auth/hybrid-sync?token=${token}&redirect=${encodeURIComponent(routePath)}`;
                    setUri(syncUrl);
                } else {
                    const separator = routePath.includes('?') ? '&' : '?';
                    setUri(`${apiUrl}${routePath}${separator}__omni_token=${token}`);
                }
            } else {
                setUri(`${apiUrl}${routePath}`);
            }
        };
        prepareUri();
    }, [routePath, session]);

    // Request Native Permissions for the WebView to inherit
    useEffect(() => {
        const req = async () => {
            const status = await Radar.requestPermissions(false); // Foreground is enough for WebView
            console.log('WebView Native Permission Status:', status);
        };
        req();
    }, []);

    const insets = useSafeAreaInsets();

    // Script to hide web-only elements and add bottom padding for the floating tab bar
    const hideWebElementsScript = `
        (function() {
            const style = document.createElement('style');
            style.innerHTML = \`
                nav, 
                footer, 
                header:not(.native-header), 
                .fixed-top, 
                .fixed-bottom { 
                    display: none !important; 
                } 
                body { 
                    padding-top: 0 !important; 
                    padding-bottom: 100px !important; 
                    margin-top: 0 !important;
                }
            \`;
            document.head.appendChild(style);

            // Hide auth buttons in the web content manually
            document.querySelectorAll('a[href*="sign-in"], a[href*="sign-up"], button').forEach(el => {
                if (el.textContent.toLowerCase().includes('sign in') || el.textContent.toLowerCase().includes('log in')) {
                    el.style.display = 'none';
                }
            });
        })();
        true;
    `;

    const handleNavigation = (navState: any) => {
        // Intercept Web Sign-In/Up redirects and force Native Login
        const url = navState.url.toLowerCase();
        if (url.includes('sign-in') || url.includes('sign-up') || url.includes('clerk.com')) {
            if (!userId) {
                // Not logged in natively? Force Native Sign In
                router.replace('/(auth)/sign-in');
            } else {
                // If they are logged in natively but web is asking for sign in, 
                // it might be a session mismatch. Redirect to homepage for now.
                router.replace('/');
            }
            return false;
        }
        return true;
    };

    return (
        <View style={s.container}>
            <WebView
                source={{
                    uri,
                    headers: {
                        'X-Omni-Native-Shell': 'true',
                        'X-Omni-Native-User': userId || 'guest'
                    }
                }}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={s.loading}>
                        <ActivityIndicator size="large" color="#39FF14" />
                    </View>
                )}
                style={{ flex: 1, backgroundColor: '#050505' }}
                injectedJavaScript={hideWebElementsScript}
                onNavigationStateChange={handleNavigation}
                scalesPageToFit={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                geolocationEnabled={true}
                mediaPlaybackRequiresUserAction={false}
                pullToRefreshEnabled={true}
            />
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505',
    },
    loading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#050505',
        zIndex: 10
    }
});
