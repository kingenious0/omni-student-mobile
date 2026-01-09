import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform, AppState, AppStateStatus } from 'react-native';
import { WebView } from 'react-native-webview';
import Radar from 'react-native-radar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, useSession } from '@clerk/clerk-expo';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface WebViewScreenProps {
    routePath: string;
}

export default function WebViewScreen({ routePath }: WebViewScreenProps) {
    const router = useRouter();
    const { isLoaded: authLoaded, userId } = useAuth();
    const { session } = useSession();
    const [uri, setUri] = useState('');
    const [webviewKey, setWebviewKey] = useState(0); // Used to force reload on crash/resume
    const appState = useRef(AppState.currentState);
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://omni-lilac.vercel.app';

    // 1. Prepare URI Logic
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

    // 2. Handle App State (Resume from Background)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                console.log('App has come to the foreground! checking webview...');
                // Force reload to ensure session sync is fresh and we verify we aren't on the landing page
                setWebviewKey(prev => prev + 1);
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Request Native Permissions
    useEffect(() => {
        const req = async () => {
            const status = await Radar.requestPermissions(false);
            console.log('WebView Native Permission Status:', status);
        };
        req();
    }, []);

    const insets = useSafeAreaInsets();

    // Script to hide web-only elements
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
        const url = navState.url.toLowerCase();
        if (url.includes('sign-in') || url.includes('sign-up') || url.includes('clerk.com')) {
            if (!userId) {
                router.replace('/(auth)/sign-in');
            } else {
                router.replace('/');
            }
            return false;
        }
        return true;
    };

    // 3. Crash Recovery Handler
    const reload = () => setWebviewKey(prev => prev + 1);

    return (
        <View style={s.container}>
            <WebView
                key={webviewKey} // Changing this forces a full unmount/remount
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

                onMessage={async (event) => {
                    try {
                        const data = JSON.parse(event.nativeEvent.data);

                        if (data.type === 'PAYMENT_SUCCESS') {
                            router.replace('/(tabs)/orders');
                        }

                        if (data.type === 'DOWNLOAD_BLOB') {
                            const { base64, filename, mimetype } = data;

                            // strip data:image/png;base64, prefix if it exists
                            const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;

                            const fileUri = `${FileSystem.documentDirectory}${filename}`;

                            await FileSystem.writeAsStringAsync(fileUri, cleanBase64, {
                                encoding: FileSystem.EncodingType.Base64
                            });

                            if (await Sharing.isAvailableAsync()) {
                                await Sharing.shareAsync(fileUri, {
                                    mimeType: mimetype,
                                    dialogTitle: `Save ${filename}`
                                });
                            }
                        }
                    } catch (e) {
                        // Ignore non-JSON messages or failures
                        console.log('WebView Message Error:', e);
                    }
                }}

                // CRITICAL: Handle Android Process Crashes/Terminations
                onRenderProcessGone={syntheticEvent => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView Process Gone: ', nativeEvent.didCrash);
                    reload(); // Auto-reload on crash
                }}
                onContentProcessDidTerminate={syntheticEvent => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView Content Process Terminated: ', nativeEvent);
                    reload(); // Auto-reload on termination
                }}
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
