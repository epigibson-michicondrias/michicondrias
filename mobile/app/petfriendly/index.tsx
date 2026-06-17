import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import WebMapView from '../../src/components/WebMapView';
import { PetfriendlyPlace } from '../../src/services/petfriendly';
import { usePlaces } from '@/src/hooks/petfriendly/usePlaces';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Map as MapIcon, List, Star, MapPin, Plus } from 'lucide-react-native';
import SearchBar from '@/src/components/SearchBar';
import EmptyState from '@/src/components/EmptyState';
import LoadingOverlay from '@/src/components/LoadingOverlay';

const { width } = Dimensions.get('window');

export default function PetfriendlyScreen() {
    const { theme } = useTheme();
    const {
        places, isLoading, searchQuery, viewMode, mapMarkers,
        setSearchQuery, toggleViewMode, goToPlace, goToNewPlace, goBack,
    } = usePlaces();

    const renderPlaceItem = ({ item }: { item: PetfriendlyPlace }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => goToPlace(item.id)}
        >
            <Image
                source={{ uri: item.image_url || 'https://via.placeholder.com/100' }}
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
        <ScreenContainer>
            <ScreenHeader
                title="Lugares Petfriendly"
                onBack={goBack}
                actionIcon={Plus}
                onAction={goToNewPlace}
            />

            <View style={styles.searchWrapper}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar lugares..."
                />
                <TouchableOpacity
                    style={[styles.mapToggleBtn, { backgroundColor: viewMode === 'map' ? theme.primary : theme.primary + '15' }]}
                    onPress={toggleViewMode}
                >
                    {viewMode === 'map' ? <List size={18} color="#fff" /> : <MapIcon size={18} color={theme.primary} />}
                </TouchableOpacity>
            </View>

            {viewMode === 'map' ? (
                    <View style={{ flex: 1 }}>
                    <WebMapView
                        style={{ flex: 1 }}
                        markers={mapMarkers}
                        onMarkerPress={(id: string) => goToPlace(id)}
                    />
                    </View>
            ) : (
                <FlatList
                    data={places}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPlaceItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        isLoading ? (
                            <View style={styles.empty}>
                                <LoadingOverlay message="Cargando lugares..." />
                            </View>
                        ) : (
                            <EmptyState
                                icon={<MapPin size={32} color={theme.textMuted} />}
                                title="Sin resultados"
                                subtitle="No se encontraron lugares"
                            />
                        )
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    searchWrapper: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 12,
        gap: 10,
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
});
