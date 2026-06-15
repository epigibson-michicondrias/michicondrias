import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

export default function MapTestScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Map Test</Text>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 19.4326,
                    longitude: -99.1332,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    title: { color: '#fff', fontSize: 20, textAlign: 'center', padding: 20 },
    map: { flex: 1 },
});
