import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import {
    Heart,
    MapPin,
    Plus,
    Dog,
    Cat,
    PawPrint,
    LayoutGrid,
    List,
    ClipboardList,
    FolderHeart,
    SlidersHorizontal,
    X,
    Mars,
    Venus,
    AlertCircle,
    Check,
} from 'lucide-react-native';
import { useListings } from '@/src/hooks/adopciones/useListings';
import { useGridCell, useViewMode } from '@/src/hooks/useViewMode';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import ViewModeToggle from '@/src/components/ViewModeToggle';
import Badge from '@/src/components/Badge';
import BottomSheet from '@/src/components/BottomSheet';
import Button from '@/src/components/Button';
import { MediaCard, MediaRow, type MediaLine } from '@/src/components/MediaCard';
import { capitalize, getSpeciesLabel } from '@/src/utils/formatters';
import type { Listing } from '@/src/types/adopciones';
import { spacing, layout, families, font, radius } from '@/constants/design';

const VIEW_MODES = ['grid', 'list'] as const;
type ListingViewMode = (typeof VIEW_MODES)[number];
const VIEW_OPTIONS = [
    { value: 'grid' as const, label: 'Ver en cuadrícula', icon: LayoutGrid },
    { value: 'list' as const, label: 'Ver como lista', icon: List },
];
const GAP: Record<ListingViewMode, number> = { grid: spacing.md, list: spacing.sm };

const speciesIcon = (species: string) => (species === 'gato' ? Cat : species === 'perro' ? Dog : PawPrint);

export default function AdopcionesScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        listings,
        isLoading,
        isRefetching,
        refetch,
        search,
        setSearch,
        speciesFilter,
        setSpeciesFilter,
        sizeFilter,
        setSizeFilter,
        genderFilter,
        setGenderFilter,
        urgentOnly,
        setUrgentOnly,
        clearFilters,
        activeFiltersCount,
    } = useListings();

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [viewMode, setViewMode] = useViewMode<ListingViewMode>('adopciones', VIEW_MODES, 'grid');
    const isGrid = viewMode === 'grid';
    const gap = GAP[viewMode];
    const { columns, cellWidth } = useGridCell(gap);

    const hasActiveFilters = search.trim() !== '' || activeFiltersCount > 0;

    const getSpeciesColor = (species: string) => {
        switch (species.toLowerCase()) {
            case 'perro': return theme.warning;
            case 'gato': return theme.accent;
            case 'ave': return theme.info;
            default: return theme.success;
        }
    };

    const renderItem = ({ item }: { item: Listing }) => {
        const species = item.species.toLowerCase();
        const gender = item.gender === 'hembra' ? 'Hembra' : 'Macho';
        const urgent = item.is_emergency ? <Badge label="Urgente" color={theme.error} variant="solid" size="sm" /> : undefined;
        const common = {
            imageUrl: item.photo_url,
            fallbackIcon: speciesIcon(species),
            fallbackColor: getSpeciesColor(species),
            title: item.name,
            onPress: () => router.push(`/adopciones/${item.id}` as any),
            accessibilityLabel: `${item.name}, ${getSpeciesLabel(species)}${item.is_emergency ? ', urgente' : ''}`,
        };
        const breedLine: MediaLine = { text: `${item.breed ? capitalize(item.breed) : 'Mestizo'} · ${gender}` };
        const placeLine: MediaLine = { text: item.location || 'Sin ubicación', icon: MapPin };

        return isGrid
            ? <MediaCard {...common} width={cellWidth} topLeft={urgent} lines={[breedLine, placeLine]} />
            : <MediaRow {...common} trailing={urgent} lines={[breedLine, placeLine]} />;
    };

    const header = (
        <View style={styles.filterSection}>
            {/* Fila compacta de Búsqueda + Botón de Filtros con Badge */}
            <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                    <SearchBar
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Busca por nombre, raza, zona..."
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
            </View>

            {/* Chips rápidos horizontales delgados + Toggle de vista */}
            <View style={styles.quickFiltersWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.chipsScroll}
                    contentContainerStyle={styles.chipsContainer}
                >
                    {hasActiveFilters && (
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Limpiar todos los filtros"
                            style={[styles.clearPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            onPress={clearFilters}
                        >
                            <X size={12} color={theme.textMuted} />
                            <Text style={[styles.clearPillText, { color: theme.textMuted }]}>Limpiar</Text>
                        </TouchableOpacity>
                    )}
                    <FilterChip
                        label="Todos"
                        active={speciesFilter === 'all' && sizeFilter === 'all' && genderFilter === 'all' && !urgentOnly}
                        onPress={clearFilters}
                    />
                    <FilterChip
                        label="Perros"
                        icon={<Dog size={14} color={speciesFilter === 'perro' ? theme.onPrimary : theme.warning} />}
                        active={speciesFilter === 'perro'}
                        onPress={() => setSpeciesFilter(speciesFilter === 'perro' ? 'all' : 'perro')}
                    />
                    <FilterChip
                        label="Gatos"
                        icon={<Cat size={14} color={speciesFilter === 'gato' ? theme.onPrimary : theme.accent} />}
                        active={speciesFilter === 'gato'}
                        onPress={() => setSpeciesFilter(speciesFilter === 'gato' ? 'all' : 'gato')}
                    />
                    <FilterChip
                        label="Urgentes"
                        icon={<AlertCircle size={14} color={urgentOnly ? theme.onPrimary : theme.error} />}
                        active={urgentOnly}
                        onPress={() => setUrgentOnly(!urgentOnly)}
                    />
                    <FilterChip
                        label="Grandes"
                        active={sizeFilter === 'grande'}
                        onPress={() => setSizeFilter(sizeFilter === 'grande' ? 'all' : 'grande')}
                    />
                </ScrollView>
                {listings.length > 0 && (
                    <View style={styles.viewToggleContainer}>
                        <ViewModeToggle value={viewMode} onChange={setViewMode} options={VIEW_OPTIONS} />
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Adopciones"
                subtitle="Encuentra a tu nuevo mejor amigo"
                actions={[
                    { icon: ClipboardList, label: 'Mis solicitudes para adoptar', onPress: () => router.push('/adopciones/mis-solicitudes') },
                    { icon: FolderHeart, label: 'Mis publicaciones', onPress: () => router.push('/adopciones/mis-publicaciones') },
                    { icon: Plus, label: 'Dar en adopción', onPress: () => router.push('/adopciones/nuevo') },
                ]}
            />

            <DataList
                data={listings}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                key={isGrid ? `grid-${columns}` : 'list'}
                isLoading={isLoading}
                skeleton
                numColumns={isGrid ? columns : 1}
                columnWrapperStyle={isGrid ? { gap } : undefined}
                ItemSeparatorComponent={() => <View style={{ height: gap }} />}
                onRefresh={refetch}
                isRefreshing={isRefetching}
                header={header}
                emptyIcon={<Heart size={layout.icon.xl} color={theme.textMuted} strokeWidth={1.5} />}
                emptyTitle={hasActiveFilters ? 'Sin resultados' : 'Aún no hay mascotas en adopción'}
                emptySubtitle={hasActiveFilters ? 'Prueba con otra búsqueda o quita los filtros.' : 'Cuando un refugio publique una mascota aparecerá aquí.'}
            />

            {/* Modal Premium de Filtros Homologado */}
            <BottomSheet
                visible={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                title="Filtros de adopción"
            >
                <View style={styles.modalContent}>
                    {/* Header secundario con acción limpiar */}
                    <View style={styles.modalSubHeader}>
                        <Text style={[styles.modalSubTitle, { color: theme.textMuted }]}>
                            Personaliza tu búsqueda para encontrar al compañero ideal
                        </Text>
                        {activeFiltersCount > 0 && (
                            <TouchableOpacity onPress={clearFilters} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Text style={[styles.modalResetText, { color: theme.primary }]}>Limpiar todo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Sección: Especie */}
                    <View style={styles.filterSectionGroup}>
                        <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Especie</Text>
                        <View style={styles.optionsGrid}>
                            {[
                                { key: 'all', label: 'Cualquiera', icon: PawPrint },
                                { key: 'perro', label: 'Perros', icon: Dog },
                                { key: 'gato', label: 'Gatos', icon: Cat },
                            ].map((item) => {
                                const isSelected = speciesFilter === item.key;
                                const IconComponent = item.icon;
                                return (
                                    <TouchableOpacity
                                        key={item.key}
                                        style={[
                                            styles.optionCard,
                                            {
                                                backgroundColor: isSelected ? theme.primary + '10' : theme.surface,
                                                borderColor: isSelected ? theme.primary : theme.border,
                                            },
                                        ]}
                                        onPress={() => setSpeciesFilter(item.key)}
                                    >
                                        <View style={[styles.optionIconBox, { backgroundColor: isSelected ? theme.primary + '20' : theme.background }]}>
                                            <IconComponent size={18} color={isSelected ? theme.primary : theme.textMuted} />
                                        </View>
                                        <Text style={[styles.optionCardText, { color: isSelected ? theme.primary : theme.text, fontFamily: isSelected ? families.bold : families.medium }]}>
                                            {item.label}
                                        </Text>
                                        <View style={[styles.radioIndicator, { borderColor: isSelected ? theme.primary : theme.border }]}>
                                            {isSelected && <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Sección: Tamaño */}
                    <View style={styles.filterSectionGroup}>
                        <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Tamaño</Text>
                        <View style={styles.optionsRow}>
                            {[
                                { key: 'all', label: 'Todos' },
                                { key: 'chico', label: 'Pequeño' },
                                { key: 'mediano', label: 'Mediano' },
                                { key: 'grande', label: 'Grande' },
                            ].map((sz) => {
                                const isSelected = sizeFilter === sz.key;
                                return (
                                    <TouchableOpacity
                                        key={sz.key}
                                        style={[
                                            styles.pillOption,
                                            {
                                                backgroundColor: isSelected ? theme.primary : theme.surface,
                                                borderColor: isSelected ? theme.primary : theme.border,
                                            },
                                        ]}
                                        onPress={() => setSizeFilter(sz.key)}
                                    >
                                        <Text style={[styles.pillOptionText, { color: isSelected ? theme.onPrimary : theme.text, fontFamily: isSelected ? families.bold : families.medium }]}>
                                            {sz.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Sección: Género */}
                    <View style={styles.filterSectionGroup}>
                        <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Género</Text>
                        <View style={styles.optionsGrid}>
                            {[
                                { key: 'all', label: 'Cualquiera', icon: PawPrint },
                                { key: 'macho', label: 'Macho', icon: Mars },
                                { key: 'hembra', label: 'Hembra', icon: Venus },
                            ].map((g) => {
                                const isSelected = genderFilter === g.key;
                                const IconComp = g.icon;
                                return (
                                    <TouchableOpacity
                                        key={g.key}
                                        style={[
                                            styles.optionCard,
                                            {
                                                backgroundColor: isSelected ? theme.primary + '10' : theme.surface,
                                                borderColor: isSelected ? theme.primary : theme.border,
                                            },
                                        ]}
                                        onPress={() => setGenderFilter(g.key)}
                                    >
                                        <View style={[styles.optionIconBox, { backgroundColor: isSelected ? theme.primary + '20' : theme.background }]}>
                                            <IconComp size={18} color={isSelected ? theme.primary : theme.textMuted} />
                                        </View>
                                        <Text style={[styles.optionCardText, { color: isSelected ? theme.primary : theme.text, fontFamily: isSelected ? families.bold : families.medium }]}>
                                            {g.label}
                                        </Text>
                                        <View style={[styles.radioIndicator, { borderColor: isSelected ? theme.primary : theme.border }]}>
                                            {isSelected && <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Sección: Prioridad de rescate */}
                    <View style={styles.filterSectionGroup}>
                        <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Casos especiales</Text>
                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                {
                                    backgroundColor: urgentOnly ? theme.error + '10' : theme.surface,
                                    borderColor: urgentOnly ? theme.error : theme.border,
                                },
                            ]}
                            onPress={() => setUrgentOnly(!urgentOnly)}
                        >
                            <View style={[styles.optionIconBox, { backgroundColor: urgentOnly ? theme.error + '20' : theme.background }]}>
                                <AlertCircle size={18} color={urgentOnly ? theme.error : theme.textMuted} />
                            </View>
                            <View style={styles.optionDetails}>
                                <Text style={[styles.optionCardText, { color: urgentOnly ? theme.error : theme.text, fontFamily: families.bold }]}>
                                    Solo casos urgentes
                                </Text>
                                <Text style={[styles.optionCardSub, { color: theme.textMuted }]}>
                                    Mascotas en peligro o que necesitan hogar prioritario
                                </Text>
                            </View>
                            <View style={[styles.checkboxIndicator, { borderColor: urgentOnly ? theme.error : theme.border, backgroundColor: urgentOnly ? theme.error : 'transparent' }]}>
                                {urgentOnly && <Check size={12} color="#FFFFFF" />}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Footer de Acciones del Modal */}
                    <View style={styles.modalFooter}>
                        <Button
                            label="Restablecer"
                            variant="secondary"
                            onPress={clearFilters}
                            style={styles.footerBtnHalf}
                        />
                        <Button
                            label={`Ver ${listings.length} ${listings.length === 1 ? 'mascota' : 'mascotas'}`}
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
    filterSection: {
        marginTop: spacing.xs,
        marginBottom: spacing.sm,
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
    quickFiltersWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
        gap: spacing.xs,
    },
    chipsScroll: {
        flex: 1,
    },
    chipsContainer: {
        alignItems: 'center',
        gap: spacing.xs,
        paddingRight: spacing.sm,
    },
    viewToggleContainer: {
        marginLeft: spacing.xs,
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
    // Estilos del Modal Homologado
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
        flex: 1,
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
