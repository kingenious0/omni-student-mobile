import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const COLORS = {
    background: '#050505',
    surface: '#0d1117',
    primary: '#39FF14',
    border: 'rgba(255,255,255,0.1)',
};

export default function ProfileScreen() {
    const { signOut } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut();
            // Force navigation to clear native state
            router.replace('/(auth)/sign-in');
            console.log('Native Session Terminated.');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    return (
        <View style={s.container}>
            <SignedIn>
                <ScrollView contentContainerStyle={s.content}>
                    {/* Header: User Info */}
                    <View style={s.header}>
                        <View style={s.avatarContainer}>
                            {user?.imageUrl ? (
                                <Image source={{ uri: user.imageUrl }} style={s.avatar} />
                            ) : (
                                <View style={[s.avatar, s.avatarPlaceholder]}>
                                    <FontAwesome5 name="user" size={30} color={COLORS.primary} />
                                </View>
                            )}
                        </View>
                        <Text style={s.userName}>{user?.fullName || 'Student'}</Text>
                        <Text style={s.userEmail}>{user?.primaryEmailAddress?.emailAddress}</Text>

                        <View style={s.badge}>
                            <Text style={s.badgeText}>OMNI RESIDENT</Text>
                        </View>
                    </View>

                    {/* Menu Items */}
                    <View style={s.menuSection}>
                        <MenuItem
                            icon="id-card"
                            label="Account Logistics"
                            onPress={() => router.push('/profile-management')}
                        />
                        <MenuItem
                            icon="shield-alt"
                            label="Security & Encrypt"
                            onPress={() => router.push('/profile-management')}
                        />
                        <View style={s.divider} />

                        {user?.publicMetadata?.role === 'VENDOR' && (
                            <MenuItem
                                icon="store"
                                label="Vendor Terminal"
                                onPress={() => router.push('/vendor-terminal')}
                                color={COLORS.primary}
                            />
                        )}

                        {user?.publicMetadata?.role === 'RUNNER' && (
                            <MenuItem
                                icon="running"
                                label="Runner Operations"
                                onPress={() => router.push('/runner-operations')}
                                color="#3498db"
                            />
                        )}
                    </View>

                    {/* Logout */}
                    <TouchableOpacity style={s.logoutBtn} onPress={handleSignOut}>
                        <FontAwesome5 name="power-off" size={16} color="#ff4d4d" />
                        <Text style={s.logoutText}>TERMINATE SESSION</Text>
                    </TouchableOpacity>

                    <Text style={s.version}>OMNI MOBILE v1.0.0 • SECTOR 01</Text>
                </ScrollView>
            </SignedIn>

            <SignedOut>
                <View style={s.center}>
                    <View style={s.loginCard}>
                        <FontAwesome5 name="lock" size={40} color={COLORS.primary} style={{ marginBottom: 20 }} />
                        <Text style={s.loginTitle}>ACCESS RESTRICTED</Text>
                        <Text style={s.loginSub}>Uplink required to view account data</Text>
                        <Link href="/(auth)/sign-in" asChild>
                            <TouchableOpacity style={s.btn}>
                                <Text style={s.btnText}>INITIALIZE SIGN IN</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </SignedOut>
        </View>
    );
}

function MenuItem({ icon, label, onPress, color = 'white' }: any) {
    return (
        <TouchableOpacity style={s.menuItem} onPress={onPress}>
            <View style={s.menuLeft}>
                <View style={s.iconBg}>
                    <FontAwesome5 name={icon} size={16} color={color} />
                </View>
                <Text style={[s.menuLabel, { color }]}>{label}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={12} color="#444" />
        </TouchableOpacity>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 25, paddingTop: 60 },
    header: { alignItems: 'center', marginBottom: 40 },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: COLORS.primary,
        padding: 5,
        marginBottom: 15,
    },
    avatar: { width: '100%', height: '100%', borderRadius: 45 },
    avatarPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
    userName: { color: 'white', fontSize: 24, fontWeight: '900', textTransform: 'uppercase' },
    userEmail: { color: '#666', fontSize: 13, marginTop: 5, fontWeight: 'bold' },
    badge: {
        backgroundColor: 'rgba(57, 255, 20, 0.1)',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
        marginTop: 15,
        borderWidth: 1,
        borderColor: 'rgba(57, 255, 20, 0.2)'
    },
    badgeText: { color: COLORS.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 },

    menuSection: { backgroundColor: COLORS.surface, borderRadius: 25, padding: 10, marginBottom: 30 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18
    },
    menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    iconBg: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
    menuLabel: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 15 },

    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: 'rgba(255, 77, 77, 0.1)',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 77, 77, 0.2)'
    },
    logoutText: { color: '#ff4d4d', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
    version: { textAlign: 'center', color: '#333', fontSize: 10, fontWeight: '900', marginTop: 30, letterSpacing: 2 },

    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
    loginCard: { width: '100%', backgroundColor: COLORS.surface, borderRadius: 30, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
    loginTitle: { color: 'white', fontSize: 22, fontWeight: '900', marginBottom: 10 },
    loginSub: { color: '#666', fontSize: 14, textAlign: 'center', marginBottom: 30, fontWeight: '600' },
    btn: { backgroundColor: COLORS.primary, paddingVertical: 18, paddingHorizontal: 30, borderRadius: 15, alignSelf: 'stretch', alignItems: 'center' },
    btnText: { color: 'black', fontWeight: '900', fontSize: 14, letterSpacing: 1 }
});
