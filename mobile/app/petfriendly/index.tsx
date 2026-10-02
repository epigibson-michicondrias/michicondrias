import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, ScrollView } from 'react-native';
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
import AppRefreshControl from '@/src/components/AppRefreshControl';
import FilterChip from '@/src/components/FilterChip';

export default function PetfriendlyScreen() {
    const { theme } = useTheme();
    const {
        places, isLoading, isError, refetch, categories, category, setCategory, searchQuery, viewMode, mapMarkers,
        setSearchQuery, toggleViewMode, goToPlace, goToNewPlace, goBack,
    } = usePlaces();

    const renderPlaceItem = ({ item }: { item: PetfriendlyPlace }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${item.category}`}
            onPress={() => goToPlace(item.id)}
        >
            {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.cardImage} />
            ) : (
                <View style={[styles.cardImage, { backgroundColor: theme.primary + '15', alignItems: 'center', justifyContent: 'center' }]}>
                    <MapPin size={28} color={theme.primary} />
                </View>
            )}
            <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.placeName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    {!!item.rating && item.rating > 0 && (
                        <View style={styles.rating}>
                            <Star size={12} color={theme.warning} fill={theme.warning} />
                            <Text style={[styles.ratingText, { color: theme.text }]}>{item.rating?.toFixed(1)}</Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.category, { color: theme.primary }]}>{item.category}</Text>
                {!!item.address && (
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
                    accessibilityRole="button"
                    accessibilityLabel={viewMode === 'map' ? 'Ver como lista' : 'Ver en el mapa'}
                    style={[styles.mapToggleBtn, { backgroundColor: viewMode === 'map' ? theme.primary : theme.primary + '15' }]}
                    onPress={toggleViewMode}
                >
                    {viewMode === 'map' ? <List size={18} color="#fff" /> : <MapIcon size={18} color={theme.primary} />}
                </TouchableOpacity>
            </View>

            {categories.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.chips}>
                    <FilterChip label="Todos" active={!category} onPress={() => setCategory(null)} />
                    {categories.map((c) => (
                        <FilterChip key={c} label={c} active={category === c} onPress={() => setCategory(category === c ? null : c)} />
                    ))}
                </ScrollView>
            )}

            {viewMode === 'map' ? (
                    <View style={{ flex: 1 }}>
                    <WebMapView
                        style={{ flex: 1 }}
                        markers={mapMarkers.map((m) => ({ ...m, color: theme.primary }))}
                        onMarkerPress={(id: string) => goToPlace(id)}
                    />
                    </View>
            ) : (
                <FlatList
            refreshControl={<AppRefreshControl />}
                    data={places}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPlaceItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        isLoading ? (
                            <View style={styles.empty}>
                                <LoadingOverlay message="Cargando lugares..." />
                            </View>
                        ) : isError ? (
                            <EmptyState
                                icon={<MapPin size={32} color={theme.textMuted} />}
                                title="No se pudieron cargar los lugares"
                                subtitle="Revisa tu conexión e inténtalo de nuevo."
                                actionLabel="Reintentar"
                                onAction={() => refetch()}
                            />
                        ) : (
                            <EmptyState
                                icon={<MapPin size={32} color={theme.textMuted} />}
                                title={searchQuery || category ? 'Sin resultados' : 'Aún no hay lugares'}
                                subtitle={searchQuery || category ? 'Prueba con otra búsqueda o categoría.' : 'Sé el primero en agregar un lugar pet friendly con el botón +.'}
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
    chips: { paddingHorizontal: 24, gap: 8, paddingBottom: 8 },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
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
