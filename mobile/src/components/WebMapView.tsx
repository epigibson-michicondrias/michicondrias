import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export interface MapMarker {
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    color?: string;
}

interface WebMapViewProps {
    style?: any;
    initialLatitude?: number;
    initialLongitude?: number;
    initialZoom?: number;
    markers?: MapMarker[];
    onMarkerPress?: (markerId: string) => void;
}

export default function WebMapView({
    style,
    initialLatitude = 19.4326,
    initialLongitude = -99.1332,
    initialZoom = 12,
    markers = [],
    onMarkerPress,
}: WebMapViewProps) {
    const html = useMemo(() => {
        const markersJS = markers
            .map(
                (m) => `
                L.marker([${m.latitude}, ${m.longitude}], {
                    icon: L.divIcon({
                        className: '',
                        html: '<div style="background:${m.color || '#ef4444'};width:24px;height:24px;border-radius:12px;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-size:12px;">🐾</span></div>',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12],
                    })
                }).addTo(map).bindPopup('<b>${(m.title || '').replace(/'/g, "\\'")}</b><br/><small>${(m.description || '').replace(/'/g, "\\'")}</small>');
                marker_${m.id.replace(/[^a-zA-Z0-9]/g, '_')} = L.marker([${m.latitude}, ${m.longitude}]).addTo(map);
                marker_${m.id.replace(/[^a-zA-Z0-9]/g, '_')}.on('click', function() {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', id: '${m.id}' }));
                });
            `
            )
            .join('\n');

        return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #map { width: 100%; height: 100%; }
        .leaflet-popup-content-wrapper { border-radius: 12px; }
        .leaflet-popup-content { font-family: -apple-system, sans-serif; font-size: 13px; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        var map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        }).setView([${initialLatitude}, ${initialLongitude}], ${initialZoom});

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);
        L.control.attribution({ position: 'bottomleft', prefix: '' }).addTo(map);

        var markers_group = L.layerGroup().addTo(map);
        ${markersJS}
    </script>
</body>
</html>`;
    }, [markers, initialLatitude, initialLongitude, initialZoom]);

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'markerPress' && onMarkerPress) {
                onMarkerPress(data.id);
            }
        } catch (e) {}
    };

    return (
        <View style={[styles.container, style]}>
            <WebView
                source={{ html }}
                style={styles.webview}
                onMessage={handleMessage}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                renderLoading={() => (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color="#0ea5e9" />
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, overflow: 'hidden', borderRadius: 16 },
    webview: { flex: 1 },
    loading: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0f2fe',
    },
});
