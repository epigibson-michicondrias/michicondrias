import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import WebMapView from '../../src/components/WebMapView';
import { useQuery } from '@tanstack/react-query';
import { getPlaces, PetfriendlyPlace } from '../../src/services/petfriendly';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Search, Map as MapIcon, List, Star, MapPin, Plus } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PetfriendlyScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'map' | 'list'>('list');

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
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push(`/petfriendly/${item.id}` as any)}
        >
            <Image
                source={{ uri: item.photo_url || 'https://via.placeholder.com/100' }}
                style={styles.cardImage}
            />
            <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.placeName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    {item.rating != null && (
                        <View style={styles.rating}>
                            <Star size={12} color="#f59e0b" fill="#f59e0b" />
                            <Text style={[styles.ratingText, { color: theme.text }]}>{item.rating?.toFixed(1)}</Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.category, { color: theme.primary }]}>{item.category}</Text>
                {item.address && (
                    <View style={styles.addressRow}>
                        <MapPin size={12} color={theme.textMuted} />
                        <Text style={[styles.address, { color: theme.textMuted }]} numberOfLines={1}>{item.address}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.overlayHover }]}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Lugares Petfriendly</Text>
                <TouchableOpacity
                    onPress={() => router.push('/petfriendly/nuevo' as any)}
                    style={[styles.addBtn, { backgroundColor: theme.primary }]}
                >
                    <Plus size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchWrapper}>
                <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Search size={18} color={theme.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Buscar lugares..."
                        placeholderTextColor={theme.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity
                    style={[styles.mapToggleBtn, { backgroundColor: viewMode === 'map' ? theme.primary : theme.primary + '15' }]}
                    onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                >
                    {viewMode === 'map' ? <List size={18} color="#fff" /> : <MapIcon size={18} color={theme.primary} />}
                </TouchableOpacity>
            </View>

            {viewMode === 'map' ? (
                    <View style={{ flex: 1 }}>
                    <WebMapView
                        style={{ flex: 1 }}
                        markers={filteredPlaces.filter(p => p.latitude && p.longitude).map((place) => ({
                            id: place.id,
                            latitude: place.latitude!,
                            longitude: place.longitude!,
                            title: place.name,
                            description: place.category,
                            color: '#0ea5e9',
                        }))}
                        onMarkerPress={(id) => router.push(`/petfriendly/${id}` as any)}
                    />
                    </View>
            ) : (
                <FlatList
                    data={filteredPlaces}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPlaceItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        isLoading ? (
                            <View style={styles.empty}>
                                <ActivityIndicator size="small" color={theme.primary} />
                            </View>
                        ) : (
                            <View style={styles.empty}>
                                <MapPin size={48} color={theme.textMuted} />
                                <Text style={[styles.emptyText, { color: theme.textMuted }]}>No se encontraron lugares</Text>
                            </View>
                        )
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '900',
        textAlign: 'center',
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchWrapper: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 12,
        gap: 10,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    mapToggleBtn: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        borderRadius: 20,
        overflow: 'hidden',
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
    empty: {
        paddingTop: 100,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '700',
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
    calloutCategory: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 6,
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
});
