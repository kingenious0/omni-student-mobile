import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const COLORS = {
    surface: '#0d1117',
    surfaceBorder: 'rgba(255, 255, 255, 0.05)',
    foreground: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    textFaint: 'rgba(255, 255, 255, 0.4)',
};

// --- CONFIGURATION ---
const categoryConfig = [
    { id: 'food', slug: 'food-and-snacks', name: 'Food & Snacks', icon: '🍕', color: '#F97316' },
    { id: 'tech', slug: 'tech-and-gadgets', name: 'Tech & Gadgets', icon: '💻', color: '#3B82F6' },
    { id: 'books', slug: 'books-and-notes', name: 'Books & Notes', icon: '📚', color: '#22C55E' },
    { id: 'fashion', slug: 'fashion', name: 'Fashion', icon: '👕', color: '#EC4899' },
    { id: 'services', slug: 'services', name: 'Services', icon: '⚡', color: '#EAB308' },
    { id: 'misc', slug: 'everything-else', name: 'Everything Else', icon: '🎯', color: '#6366F1' }
];

export default function MobileBento() {
    const [categories, setCategories] = useState(categoryConfig.map(c => ({ ...c, count: 0 })));

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const apiUrl = process.env.EXPO_PUBLIC_API_URL;
                if (!apiUrl) return;

                const response = await fetch(`${apiUrl}/api/categories`);
                const data = await response.json();

                if (data.success) {
                    const updated = categoryConfig.map(config => {
                        const apiCat = data.categories.find((c: any) => c.slug === config.slug);
                        return {
                            ...config,
                            count: apiCat?._count?.products || 0
                        };
                    });
                    setCategories(updated);
                }
            } catch (e) {
                // console.warn('Bento fetch failed', e);
            }
        };
        fetchCounts();
    }, []);

    return (
        <View style={s.container}>
            <Text style={s.header}>Browse Categories</Text>
            <View style={s.grid}>
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={s.card}
                        activeOpacity={0.8}
                    >
                        <View style={[s.cardBg, { backgroundColor: cat.color }]} />

                        <Text style={s.icon}>{cat.icon}</Text>

                        <View>
                            <Text style={s.name} numberOfLines={1}>{cat.name}</Text>
                            <Text style={s.count}>
                                {cat.count === 0 ? '...' : `${cat.count} Items`}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { marginBottom: 40, width: '100%' },
    header: { fontSize: 18, fontWeight: '900', color: COLORS.foreground, marginBottom: 16, paddingHorizontal: 8, letterSpacing: -0.5 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: { width: '48%', marginBottom: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: 24, padding: 16, height: 128, justifyContent: 'space-between', overflow: 'hidden', position: 'relative' },
    cardBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05 },
    icon: { fontSize: 32 },
    name: { fontWeight: '900', fontSize: 12, color: COLORS.foreground, textTransform: 'uppercase', letterSpacing: -0.5 },
    count: { fontSize: 10, fontWeight: '700', color: COLORS.textFaint, textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }
});
