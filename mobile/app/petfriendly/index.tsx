import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useQuery } from '@tanstack/react-query';
import { getPlaces, PetfriendlyPlace } from '../../src/services/petfriendly';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Search, Map as MapIcon, List, Star, MapPin } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function PetfriendlyScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: places = [], isLoading } = useQuery({
        queryKey: ['petfriendly-places'],
        queryFn: () => getPlaces(),
    });

    const filteredPlaces = places.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderPlaceItem = ({ item }: { item: PetfriendlyPlace }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface }]}
            onPress={() => router.push(`/petfriendly/${item.id}` as any)}
        >
            <Image
                source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500' }}
                style={styles.cardImage}
            />
            <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.placeName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.rating}>
                        <Star size={12} color="#facc15" fill="#facc15" />
                        <Text style={[styles.ratingText, { color: theme.text }]}>{item.rating?.toFixed(1) || '4.5'}</Text>
                    </View>
                </View>
                <Text style={[styles.category, { color: theme.primary }]}>{item.category}</Text>
                <View style={styles.addressRow}>
                    <MapPin size={14} color={theme.textMuted} />
                    <Text style={[styles.address, { color: theme.textMuted }]} numberOfLines={1}>{item.address || 'Ciudad de México'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.overlayHeader}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
                        <Search size={20} color={theme.textMuted} />
                        <TextInput
                            placeholder="Restaurantes, Parques..."
                            placeholderTextColor={theme.textMuted}
                            style={[styles.searchInput, { color: theme.text }]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, viewMode === 'map' && { backgroundColor: theme.primary }]}
                        onPress={() => setViewMode('map')}
                    >
                        <MapIcon size={18} color={viewMode === 'map' ? '#fff' : theme.textMuted} />
                        <Text style={[styles.toggleText, { color: viewMode === 'map' ? '#fff' : theme.textMuted }]}>Mapa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: theme.primary }]}
                        onPress={() => setViewMode('list')}
                    >
                        <List size={18} color={viewMode === 'list' ? '#fff' : theme.textMuted} />
                        <Text style={[styles.toggleText, { color: viewMode === 'list' ? '#fff' : theme.textMuted }]}>Lista</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {viewMode === 'map' ? (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: 19.4326,
                        longitude: -99.1332,
                        latitudeDelta: 0.1,
                        longitudeDelta: 0.1,
                    }}
                    customMapStyle={mapStyle}
                >
                    {filteredPlaces.map((place) => (
                        <Marker
                            key={place.id}
                            coordinate={{
                                latitude: place.latitude || 19.4326,
                                longitude: place.longitude || -99.1332,
                            }}
                        >
                            <View style={[styles.customMarker, { backgroundColor: theme.primary }]}>
                                <Text style={styles.markerEmoji}>
                                    {place.category.toLowerCase().includes('restaurante') ? '🍴' :
                                        place.category.toLowerCase().includes('parque') ? '🌳' : '🏘️'}
                                </Text>
                            </View>
                            <Callout tooltip onPress={() => router.push(`/petfriendly/${place.id}` as any)}>
                                <View style={[styles.callout, { backgroundColor: theme.surface }]}>
                                    <Text style={[styles.calloutTitle, { color: theme.text }]}>{place.name}</Text>
                                    <Text style={[styles.calloutSub, { color: theme.textMuted }]}>{place.category}</Text>
                                    <TouchableOpacity style={[styles.calloutBtn, { backgroundColor: theme.primary }]}>
                                        <Text style={styles.calloutBtnText}>Ver info</Text>
                                    </TouchableOpacity>
                                </View>
                            </Callout>
                        </Marker>
                    ))}
                </MapView>
            ) : (
                <FlatList
                    data={filteredPlaces}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPlaceItem}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={<View style={{ height: 160 }} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <ActivityIndicator size="small" color={theme.primary} />
                        </View>
                    }
                />
            )}
        </View>
    );
}

const mapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
    { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
    { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
    { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
    { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
    { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
    { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlayHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: 'transparent',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    backBtn: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        paddingHorizontal: 16,
        borderRadius: 14,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 14,
        padding: 4,
        alignSelf: 'center',
    },
    toggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    toggleText: {
        fontSize: 13,
        fontWeight: '800',
    },
    map: {
        width: width,
        height: height,
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
        gap: 20,
    },
    card: {
        flexDirection: 'row',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardImage: {
        width: 100,
        height: 100,
    },
    cardInfo: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    placeName: {
        fontSize: 16,
        fontWeight: '800',
        flex: 1,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '800',
    },
    category: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    address: {
        fontSize: 11,
        flex: 1,
    },
    customMarker: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 3,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
    },
    markerEmoji: {
        fontSize: 18,
    },
    callout: {
        width: 180,
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
        gap: 4,
    },
    calloutTitle: {
        fontSize: 15,
        fontWeight: '800',
    },
    calloutSub: {
        fontSize: 12,
        marginBottom: 8,
    },
    calloutBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    calloutBtnText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    empty: {
        paddingTop: 100,
        alignItems: 'center',
    }
});
