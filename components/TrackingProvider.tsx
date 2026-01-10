import React, { createContext, useContext, useEffect } from 'react';
import Radar from 'react-native-radar';
import { useUser } from '@clerk/clerk-expo';

interface TrackingContextType {
    startTracking: (mode?: 'RESPONSIVE' | 'EFFICIENT') => Promise<void>;
    stopTracking: () => Promise<void>;
}

const TrackingContext = createContext<TrackingContextType>({
    startTracking: async () => { },
    stopTracking: async () => { },
});

export const useTracking = () => useContext(TrackingContext);

export default function TrackingProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();

    useEffect(() => {
        const pk = process.env.EXPO_PUBLIC_RADAR_PUBLISHABLE_KEY;
        if (pk && Radar && Radar.initialize) {
            Radar.initialize(pk);
        }
    }, []);

    useEffect(() => {
        if (user) {
            Radar.setUserId(user.id);
            if (user.publicMetadata) {
                Radar.setMetadata(user.publicMetadata as any);
            }
        }
    }, [user]);

    const startTracking = async (mode: 'RESPONSIVE' | 'EFFICIENT' = 'RESPONSIVE') => {
        if (!Radar) return;

        try {
            // Request Permissions (Foreground = false)
            // Background prompts can be slow and hang the UI on login.
            // We'll use foreground for now, and request background later if needed.
            const status = await Radar.requestPermissions(false);
            console.log('Radar Permission Status:', status);

            if (status === 'GRANTED_BACKGROUND' || status === 'GRANTED_FOREGROUND') {
                if (mode === 'RESPONSIVE') {
                    await Radar.startTrackingResponsive();
                } else {
                    await Radar.startTrackingEfficient();
                }
            }
        } catch (e) {
            console.warn('Radar startTracking failed:', e);
        }
    };

    const stopTracking = async () => {
        await Radar.stopTracking();
    };

    return (
        <TrackingContext.Provider value={{ startTracking, stopTracking }}>
            {children}
        </TrackingContext.Provider>
    );
}
