import React, { useMemo } from 'react';
import MapView, { Marker, UrlTile, Polyline, Circle } from 'react-native-maps';
import { View, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NativeTrackingMapProps {
    studentLocation: { latitude: number; longitude: number };
    vendorLocation: { latitude: number; longitude: number };
    runnerLocation: { latitude: number; longitude: number } | null;
    runnerHeading: number;
    mapLayer?: 'standard' | 'satellite';
}

export default function NativeTrackingMap({
    studentLocation,
    vendorLocation,
    runnerLocation,
    runnerHeading,
    mapLayer = 'standard'
}: NativeTrackingMapProps) {

    const urlTemplate = useMemo(() => {
        return mapLayer === 'standard'
            ? "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
            : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    }, [mapLayer]);

    return (
        <MapView
            style={{ flex: 1, width: '100%', height: '100%' }}
            initialRegion={{
                ...studentLocation,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }}
            mapType="none" // We use UrlTile instead for consistency
            rotateEnabled={false}
        >
            {/* OSM / Satellite Layer */}
            <UrlTile
                urlTemplate={urlTemplate}
                maximumZ={19}
                flipY={false}
            />

            {/* Student (Pulse Effect - Visualized as concentric circles) */}
            <Circle
                center={studentLocation}
                radius={20}
                fillColor="rgba(59, 130, 246, 0.2)"
                strokeColor="rgba(59, 130, 246, 0.5)"
            />
            <Marker coordinate={studentLocation}>
                <View className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
            </Marker>

            {/* Vendor */}
            <Marker coordinate={vendorLocation} title="Vendor" description="Pick up here">
                <Ionicons name="storefront" size={24} color="#ef4444" />
            </Marker>

            {/* Runner */}
            {runnerLocation && (
                <>
                    <Marker
                        coordinate={runnerLocation}
                        anchor={{ x: 0.5, y: 0.5 }}
                        rotation={runnerHeading}
                    >
                        <View className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border-2 border-blue-500">
                            <Ionicons name="bicycle" size={20} color="#3b82f6" />
                        </View>
                    </Marker>

                    {/* Path Line */}
                    <Polyline
                        coordinates={[runnerLocation, studentLocation]}
                        strokeColor="#3b82f6"
                        strokeWidth={3}
                        lineDashPattern={[10, 10]}
                    />
                </>
            )}
        </MapView>
    );
}
