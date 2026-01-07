import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import React, { useState, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { FontAwesome5 } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

const COLORS = {
    background: '#050505',
    surface: '#0d1117',
    primary: '#39FF14',
    foreground: '#ffffff',
    google: '#DB4437',
    apple: '#ffffff'
};

export default function SignInScreen() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();

    // OAuth Hooks
    const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: 'oauth_google' });
    const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: 'oauth_apple' });

    const onGooglePress = useCallback(async () => {
        try {
            const { createdSessionId, setActive: setOAuthActive } = await startGoogleFlow({
                redirectUrl: Linking.createURL('/(tabs)', { scheme: 'studentmobile' }),
            });

            if (createdSessionId) {
                setOAuthActive!({ session: createdSessionId });
                router.replace('/');
            }
        } catch (err: any) {
            console.error('Google OAuth Error:', err);
            alert('Authentication failed');
        }
    }, []);

    const onApplePress = useCallback(async () => {
        try {
            const { createdSessionId, setActive: setOAuthActive } = await startAppleFlow({
                redirectUrl: Linking.createURL('/(tabs)', { scheme: 'studentmobile' }),
            });

            if (createdSessionId) {
                setOAuthActive!({ session: createdSessionId });
                router.replace('/');
            }
        } catch (err: any) {
            console.error('Apple OAuth Error:', err);
            alert('Authentication failed');
        }
    }, []);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const onSignInPress = async () => {
        if (!isLoaded || loading) return;
        setLoading(true);
        try {
            const result = await signIn.create({
                identifier: identifier.trim(),
                password,
            });
            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                router.replace('/');
            }
        } catch (err: any) {
            console.log('Clerk Sign In Error:', err);
            const msg = err.errors?.[0]?.message || 'Sign in failed';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Initialize Uplink Sequence</Text>
            </View>

            <View style={styles.form}>
                <TextInput
                    autoCapitalize="none"
                    value={identifier}
                    placeholder="Username / Email"
                    placeholderTextColor="#666"
                    onChangeText={(val) => setIdentifier(val)}
                    style={styles.input}
                />
                <TextInput
                    value={password}
                    placeholder="Password"
                    placeholderTextColor="#666"
                    secureTextEntry={true}
                    onChangeText={(password) => setPassword(password)}
                    style={styles.input}
                />
                <TouchableOpacity
                    onPress={onSignInPress}
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="black" />
                    ) : (
                        <Text style={styles.buttonText}>SIGN IN</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.dividerText}>SECURE UPLINK VIA</Text>
                    <View style={styles.line} />
                </View>

                <View style={styles.oauthRow}>
                    <TouchableOpacity onPress={onGooglePress} style={[styles.oauthBtn, { borderColor: COLORS.google }]}>
                        <FontAwesome5 name="google" size={18} color={COLORS.google} />
                        <Text style={[styles.oauthText, { color: COLORS.google }]}>GOOGLE</Text>
                    </TouchableOpacity>

                    {Platform.OS === 'ios' && (
                        <TouchableOpacity onPress={onApplePress} style={[styles.oauthBtn, { borderColor: COLORS.apple }]}>
                            <FontAwesome5 name="apple" size={18} color={COLORS.apple} />
                            <Text style={[styles.oauthText, { color: COLORS.apple }]}>APPLE</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>New to OMNI?</Text>
                <Link href="/sign-up" asChild>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>Create Account</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: COLORS.background, padding: 30, justifyContent: 'center' },
    header: { marginBottom: 50 },
    title: { fontSize: 32, fontWeight: '900', color: COLORS.foreground, textTransform: 'uppercase' },
    subtitle: { fontSize: 12, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 2 },
    form: { gap: 15 },
    input: { backgroundColor: COLORS.surface, color: 'white', padding: 20, borderRadius: 15, fontSize: 16 },
    button: { backgroundColor: COLORS.primary, padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 10 },
    buttonText: { fontWeight: '900', color: 'black', textTransform: 'uppercase', letterSpacing: 2 },

    divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 30 },
    line: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
    dividerText: { color: '#444', fontSize: 10, fontWeight: '900', letterSpacing: 1 },

    oauthRow: { gap: 15 },
    oauthBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 18,
        borderRadius: 15,
        borderWidth: 1
    },
    oauthText: { fontWeight: '900', fontSize: 13, letterSpacing: 1 },

    footer: { marginTop: 40, flexDirection: 'row', gap: 5, justifyContent: 'center' },
    footerText: { color: '#666' },
    linkText: { color: COLORS.primary, fontWeight: 'bold' },
});
