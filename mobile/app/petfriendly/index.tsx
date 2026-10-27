import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import WebMapView from '../../src/components/WebMapView';
import { PetfriendlyPlace } from '../../src/services/petfriendly';
import { usePlaces } from '@/src/hooks/petfriendly/usePlaces';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import {
    Map as MapIcon,
    List,
    Star,
    MapPin,
    Plus,
    SlidersHorizontal,
    X,
    Utensils,
    Coffee,
    Trees,
    Hotel,
    Sparkles,
    Droplets,
    Check,
} from 'lucide-react-native';
import SearchBar from '@/src/components/SearchBar';
import EmptyState from '@/src/components/EmptyState';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import FilterChip from '@/src/components/FilterChip';
import BottomSheet from '@/src/components/BottomSheet';
import Button from '@/src/components/Button';
import { families, font, layout, radius, spacing } from '@/constants/design';

const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('caf')) return Coffee;
    if (c.includes('rest') || c.includes('comida')) return Utensils;
    if (c.includes('parque') || c.includes('aire')) return Trees;
    if (c.includes('hotel') || c.includes('hosp')) return Hotel;
    return Sparkles;
};

export default function PetfriendlyScreen() {
    const { theme } = useTheme();
    const {
        places,
        isLoading,
        isError,
        refetch,
        categories,
        category,
        setCategory,
        minRating,
        setMinRating,
        hasWaterBowlsOnly,
        setHasWaterBowlsOnly,
        hasPetMenuOnly,
        setHasPetMenuOnly,
        searchQuery,
        viewMode,
        mapMarkers,
        activeFiltersCount,
        setSearchQuery,
        clearFilters,
        toggleViewMode,
        goToPlace,
        goToNewPlace,
        goBack,
    } = usePlaces();

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const hasFilters = searchQuery.trim() !== '' || activeFiltersCount > 0;

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
                title="Pet-friendly"
                subtitle="Lugares donde tu mascota siempre es bienvenida"
                onBack={goBack}
                actionIcon={Plus}
                onAction={goToNewPlace}
            />

            {/* Barra de Búsqueda y Acciones Homologada */}
            <View style={styles.toolbar}>
                <View style={styles.searchRow}>
                    <View style={styles.searchContainer}>
                        <SearchBar
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Buscar restaurantes, parques, cafés..."
                        />
                    </View>
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Abrir filtros"
                        style={[
                            styles.filterIconButton,
                            {
                                backgroundColor: activeFiltersCount > 0 ? theme.primary : theme.surface,
                                borderColor: activeFiltersCount > 0 ? theme.primary : theme.border,
                            },
                        ]}
                        onPress={() => setIsFilterModalOpen(true)}
                    >
                        <SlidersHorizontal
                            size={19}
                            color={activeFiltersCount > 0 ? theme.onPrimary : theme.text}
                        />
                        {activeFiltersCount > 0 && (
                            <View style={[styles.filterBadge, { backgroundColor: theme.error }]}>
                                <Text style={[styles.filterBadgeText, { color: '#FFFFFF' }]}>
                                    {activeFiltersCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={viewMode === 'map' ? 'Ver como lista' : 'Ver en el mapa'}
                        style={[styles.mapToggleBtn, { backgroundColor: viewMode === 'map' ? theme.primary : theme.surface, borderColor: theme.border }]}
                        onPress={toggleViewMode}
                    >
                        {viewMode === 'map' ? <List size={18} color={theme.onPrimary} /> : <MapIcon size={18} color={theme.primary} />}
                    </TouchableOpacity>
                </View>

                {/* Chips rápidos horizontales delgados */}
                <View style={styles.quickFiltersWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                        {hasFilters && (
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Limpiar filtros"
                                style={[styles.clearPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                onPress={clearFilters}
                            >
                                <X size={12} color={theme.textMuted} />
                                <Text style={[styles.clearPillText, { color: theme.textMuted }]}>Limpiar</Text>
                            </TouchableOpacity>
                        )}
                        <FilterChip label="Todos" active={!category && minRating === 0 && !hasWaterBowlsOnly && !hasPetMenuOnly} onPress={clearFilters} />
                        {categories.map((c) => {
                            const CatIcon = getCategoryIcon(c);
                            const isSelected = category === c;
                            return (
                                <FilterChip
                                    key={c}
                                    label={c}
                                    icon={<CatIcon size={14} color={isSelected ? theme.onPrimary : theme.primary} />}
                                    active={isSelected}
                                    onPress={() => setCategory(isSelected ? null : c)}
                                />
                            );
                        })}
                        <FilterChip
                            label="4+ ★"
                            active={minRating === 4}
                            onPress={() => setMinRating(minRating === 4 ? 0 : 4)}
                        />
                    </ScrollView>
                </View>
            </View>

            {viewMode === 'map' ? (
                <View style={styles.mapContainer}>
                    <WebMapView
                        style={styles.flex}
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
                                title={hasFilters ? 'Sin resultados' : 'Aún no hay lugares'}
                                subtitle={hasFilters ? 'Prueba con otra búsqueda o limpia los filtros.' : 'Sé el primero en agregar un lugar pet friendly con el botón +.'}
                                actionLabel={hasFilters ? 'Quitar filtros' : undefined}
                                onAction={hasFilters ? clearFilters : undefined}
                            />
                        )
                    }
                />
            )}

            {/* Modal Premium Homologado para Pet-friendly */}
            <BottomSheet
                visible={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                title="Filtros Pet-friendly"
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalSubHeader}>
                        <Text style={[styles.modalSubTitle, { color: theme.textMuted }]}>
                            Encuentra el sitio perfecto para salir con tu mascota
                        </Text>
                        {activeFiltersCount > 0 && (
                            <TouchableOpacity onPress={clearFilters} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Text style={[styles.modalResetText, { color: theme.primary }]}>Limpiar todo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Sección Categorías */}
                    <View style={styles.filterSectionGroup}>
                        <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Tipo de lugar</Text>
                        <View style={styles.optionsGrid}>
                            <TouchableOpacity
                                style={[
                                    styles.optionCard,
                                    {
                                        backgroundColor: !category ? theme.primary + '10' : theme.surface,
                                        borderColor: !category ? theme.primary : theme.border,
                                    },
                                ]}
                                onPress={() => setCategory(null)}
                            >
                                <View style={[styles.optionIconBox, { backgroundColor: !category ? theme.primary + '20' : theme.background }]}>
                                    <Sparkles size={18} color={!category ? theme.primary : theme.textMuted} />
                                </View>
                                <Text style={[styles.optionCardText, { color: !category ? theme.primary : theme.text, fontFamily: !category ? families.bold : families.medium }]}>
                                    Todos los tipos
                                </Text>
                                <View style={[styles.radioIndicator, { borderColor: !category ? theme.primary : theme.border }]}>
                                    {!category && <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />}
                                </View>
                            </TouchableOpacity>

                            {categories.map((c) => {
                                const isSelected = category === c;
                                const IconC = getCategoryIcon(c);
                                return (
                                    <TouchableOpacity
                                        key={c}
                                        style={[
                                            styles.optionCard,
                                            {
                                                backgroundColor: isSelected ? theme.primary + '10' : theme.surface,
                                                borderColor: isSelected ? theme.primary : theme.border,
                                            },
                                        ]}
                                        onPress={() => setCategory(c)}
                                    >
                                        <View style={[styles.optionIconBox, { backgroundColor: isSelected ? theme.primary + '20' : theme.background }]}>
                                            <IconC size={18} color={isSelected ? theme.primary : theme.textMuted} />
                                        </View>
                                        <Text style={[styles.optionCardText, { color: isSelected ? theme.primary : theme.text, fontFamily: isSelected ? families.bold : families.medium }]}>
                                            {c}
                                        </Text>
                                        <View style={[styles.radioIndicator, { borderColor: isSelected ? theme.primary : theme.border }]}>
                                            {isSelected && <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Valoración mínima */}
                    <View style={styles.filterSectionGroup}>
                        <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Calificación mínima</Text>
                        <View style={styles.optionsRow}>
                            {[
                                { val: 0, label: 'Cualquiera' },
                                { val: 3, label: '3+ ★' },
                                { val: 4, label: '4+ ★' },
                                { val: 4.5, label: '4.5+ ★' },
                            ].map((rate) => {
                                const isSelected = minRating === rate.val;
                                return (
                                    <TouchableOpacity
                                        key={rate.val}
                                        style={[
                                            styles.pillOption,
                                            {
                                                backgroundColor: isSelected ? theme.primary : theme.surface,
                                                borderColor: isSelected ? theme.primary : theme.border,
                                            },
                                        ]}
                                        onPress={() => setMinRating(rate.val)}
                                    >
                                        <Text style={[styles.pillOptionText, { color: isSelected ? theme.onPrimary : theme.text, fontFamily: isSelected ? families.bold : families.medium }]}>
                                            {rate.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Amenidades */}
                    <View style={styles.filterSectionGroup}>
                        <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Comodidades para mascotas</Text>
                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                {
                                    backgroundColor: hasWaterBowlsOnly ? theme.primary + '10' : theme.surface,
                                    borderColor: hasWaterBowlsOnly ? theme.primary : theme.border,
                                },
                            ]}
                            onPress={() => setHasWaterBowlsOnly(!hasWaterBowlsOnly)}
                        >
                            <View style={[styles.optionIconBox, { backgroundColor: hasWaterBowlsOnly ? theme.primary + '20' : theme.background }]}>
                                <Droplets size={18} color={hasWaterBowlsOnly ? theme.primary : theme.textMuted} />
                            </View>
                            <View style={styles.optionDetails}>
                                <Text style={[styles.optionCardText, { color: hasWaterBowlsOnly ? theme.primary : theme.text, fontFamily: families.bold }]}>
                                    Tazones de agua disponibles
                                </Text>
                                <Text style={[styles.optionCardSub, { color: theme.textMuted }]}>
                                    Hidratación garantizada para tu peludo
                                </Text>
                            </View>
                            <View style={[styles.checkboxIndicator, { borderColor: hasWaterBowlsOnly ? theme.primary : theme.border, backgroundColor: hasWaterBowlsOnly ? theme.primary : 'transparent' }]}>
                                {hasWaterBowlsOnly && <Check size={12} color="#FFFFFF" />}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                {
                                    backgroundColor: hasPetMenuOnly ? theme.primary + '10' : theme.surface,
                                    borderColor: hasPetMenuOnly ? theme.primary : theme.border,
                                },
                            ]}
                            onPress={() => setHasPetMenuOnly(!hasPetMenuOnly)}
                        >
                            <View style={[styles.optionIconBox, { backgroundColor: hasPetMenuOnly ? theme.primary + '20' : theme.background }]}>
                                <Utensils size={18} color={hasPetMenuOnly ? theme.primary : theme.textMuted} />
                            </View>
                            <View style={styles.optionDetails}>
                                <Text style={[styles.optionCardText, { color: hasPetMenuOnly ? theme.primary : theme.text, fontFamily: families.bold }]}>
                                    Menú especial para mascotas
                                </Text>
                                <Text style={[styles.optionCardSub, { color: theme.textMuted }]}>
                                    Premios, snacks o platillos caninos/felinos
                                </Text>
                            </View>
                            <View style={[styles.checkboxIndicator, { borderColor: hasPetMenuOnly ? theme.primary : theme.border, backgroundColor: hasPetMenuOnly ? theme.primary : 'transparent' }]}>
                                {hasPetMenuOnly && <Check size={12} color="#FFFFFF" />}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.modalFooter}>
                        <Button
                            label="Restablecer"
                            variant="secondary"
                            onPress={clearFilters}
                            style={styles.footerBtnHalf}
                        />
                        <Button
                            label={`Ver ${places.length} ${places.length === 1 ? 'lugar' : 'lugares'}`}
                            variant="primary"
                            onPress={() => setIsFilterModalOpen(false)}
                            style={styles.footerBtnHalf}
                        />
                    </View>
                </View>
            </BottomSheet>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    toolbar: {
        paddingHorizontal: layout.screenPadding,
        paddingTop: spacing.xs,
        paddingBottom: spacing.sm,
        gap: spacing.xs,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    searchContainer: {
        flex: 1,
    },
    filterIconButton: {
        width: 46,
        height: 46,
        borderRadius: radius.md,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    filterBadgeText: {
        fontSize: 10,
        fontFamily: families.bold,
    },
    mapToggleBtn: {
        width: 46,
        height: 46,
        borderRadius: radius.md,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickFiltersWrapper: {
        marginTop: spacing.xs,
    },
    chips: {
        gap: spacing.xs,
        alignItems: 'center',
    },
    clearPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    clearPillText: {
        fontSize: font.xs,
        fontFamily: families.medium,
    },
    mapContainer: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    list: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: layout.listClearance,
        gap: spacing.md,
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
        padding: spacing.md,
        justifyContent: 'center',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    placeName: {
        fontSize: font.xl,
        fontFamily: families.extrabold,
        flex: 1,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    ratingText: {
        fontSize: font.md,
        fontFamily: families.extrabold,
    },
    category: {
        fontSize: font.sm,
        fontFamily: families.bold,
        textTransform: 'uppercase',
        marginBottom: spacing.sm,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    address: {
        fontSize: font.sm,
        flex: 1,
    },
    empty: {
        paddingTop: 100,
        alignItems: 'center',
        gap: spacing.md,
    },

    // Modal
    modalContent: {
        gap: spacing.lg,
        paddingBottom: spacing.xl,
    },
    modalSubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalSubTitle: {
        fontSize: font.xs,
        flex: 1,
        marginRight: spacing.sm,
    },
    modalResetText: {
        fontSize: font.xs,
        fontFamily: families.bold,
    },
    filterSectionGroup: {
        gap: spacing.xs,
    },
    filterGroupTitle: {
        fontSize: 13,
        fontFamily: families.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    optionsGrid: {
        gap: spacing.xs,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    pillOption: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    pillOptionText: {
        fontSize: font.sm,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm + 2,
        borderRadius: radius.md,
        borderWidth: 1,
        gap: spacing.sm,
    },
    optionIconBox: {
        width: 32,
        height: 32,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionDetails: {
        flex: 1,
    },
    optionCardText: {
        fontSize: font.sm,
    },
    optionCardSub: {
        fontSize: font.xs,
        marginTop: 2,
    },
    radioIndicator: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    checkboxIndicator: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    footerBtnHalf: {
        flex: 1,
    },
});
