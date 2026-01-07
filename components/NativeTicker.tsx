import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

// Ticker Component mimicking the Web Navbar logic
export default function NativeTicker() {
    const router = useRouter();
    const [tickerMessage, setTickerMessage] = useState<string | null>(null);
    const [tickerColor, setTickerColor] = useState('#39FF14');
    const translateX = useSharedValue(Dimensions.get('window').width);
    const [clickCount, setClickCount] = useState(0);
    const [lastClick, setLastClick] = useState(0);

    const handlePress = () => {
        const now = Date.now();
        if (now - lastClick < 500) {
            const newCount = clickCount + 1;
            setClickCount(newCount);
            if (newCount >= 3) {
                // Trigger Admin/God Mode
                router.push('/modal'); // Or a specific admin route if existing
                setClickCount(0);
            }
        } else {
            setClickCount(1);
        }
        setLastClick(now);
    };

    useEffect(() => {
        const fetchTicker = async () => {
            try {
                const apiUrl = process.env.EXPO_PUBLIC_API_URL;
                if (!apiUrl) return;

                const response = await fetch(`${apiUrl}/api/system/config`);
                const data = await response.json();
                const notice = data?.globalNotice;

                if (notice) {
                    let msg = notice;
                    if (notice.startsWith('[')) {
                        const match = notice.match(/^\[(#[a-fA-F0-9]{6}|[a-z]+)\](.*)/);
                        if (match) {
                            setTickerColor(match[1]);
                            msg = match[2];
                        }
                    }
                    setTickerMessage(msg);
                }
            } catch (e) {
                // silent fail
            }
        };

        fetchTicker();
        const interval = setInterval(fetchTicker, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (tickerMessage) {
            const duration = 10000;
            translateX.value = Dimensions.get('window').width;
            translateX.value = withRepeat(
                withTiming(-Dimensions.get('window').width * 2, { duration, easing: Easing.linear }),
                -1,
                false
            );
        }
    }, [tickerMessage]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }]
    }));

    if (!tickerMessage) return null;

    return (
        <TouchableOpacity activeOpacity={1} onPress={handlePress} style={[s.container, { backgroundColor: tickerColor }]}>
            <Animated.Text style={[s.text, animatedStyle]}>
                📢 {tickerMessage} • 📢 {tickerMessage} • 📢 {tickerMessage}
            </Animated.Text>
        </TouchableOpacity>
    );
}

const s = StyleSheet.create({
    container: {
        height: 24,
        justifyContent: 'center',
        overflow: 'hidden',
        width: '100%',
        position: 'absolute',
        top: 0,
        zIndex: 1000,
        elevation: 10,
    },
    text: {
        fontSize: 10,
        fontWeight: '900',
        color: '#000',
        textTransform: 'uppercase',
        letterSpacing: 2,
        width: Dimensions.get('window').width * 4,
    }
});
