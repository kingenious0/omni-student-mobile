import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, ScrollView } from 'react-native';
import React, { useState } from 'react';

const COLORS = {
    background: '#050505',
    surface: '#0d1117',
    primary: '#39FF14',
    foreground: '#ffffff',
};

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');

    const onSignUpPress = async () => {
        if (!isLoaded) return;
        try {
            await signUp.create({
                emailAddress: emailAddress.trim(),
                username: username.trim(),
                password,
            });
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
        } catch (err: any) {
            console.log('Clerk Sign Up Error:', err);
            const msg = err.errors?.[0]?.message || 'Sign up failed';
            alert(msg);
        }
    };

    const [isVerifying, setIsVerifying] = useState(false);

    // ... (existing code)

    const onPressVerify = async () => {
        if (!isLoaded || isVerifying) return;
        setIsVerifying(true);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });
            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId });
                router.replace('/');
            }
        } catch (err: any) {
            console.error('Verification Error:', err);
            const msg = err.errors?.[0]?.message || 'Verification failed';

            if (msg.toLowerCase().includes('already verified')) {
                alert('Email verified successfully! Please sign in.');
                router.replace('/(auth)/sign-in');
            } else {
                alert(msg);
            }
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Headers ... */}
            <View style={styles.header}>
                <Text style={styles.title}>{pendingVerification ? 'Verify Email' : 'Join OMNI'}</Text>
                <Text style={styles.subtitle}>{pendingVerification ? 'Verification Required' : 'Establish New Uplink'}</Text>
            </View>

            {!pendingVerification ? (
                <View style={styles.form}>
                    <TextInput
                        autoCapitalize="none"
                        value={username}
                        placeholder="Username"
                        placeholderTextColor="#666"
                        onChangeText={(val) => setUsername(val)}
                        style={styles.input}
                    />
                    <TextInput
                        autoCapitalize="none"
                        value={emailAddress}
                        placeholder="Email Address"
                        placeholderTextColor="#666"
                        onChangeText={(email) => setEmailAddress(email)}
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
                    <TouchableOpacity onPress={onSignUpPress} style={styles.button}>
                        <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.form}>
                    <TextInput
                        value={code}
                        placeholder="Verification Code"
                        placeholderTextColor="#666"
                        onChangeText={(code) => setCode(code)}
                        style={styles.input}
                    />
                    <TouchableOpacity
                        onPress={onPressVerify}
                        style={[styles.button, isVerifying && { opacity: 0.5 }]}
                        disabled={isVerifying}
                    >
                        <Text style={styles.buttonText}>{isVerifying ? 'VERIFYING...' : 'VERIFY EMAIL'}</Text>
                    </TouchableOpacity>
                </View>
            )}
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
});
