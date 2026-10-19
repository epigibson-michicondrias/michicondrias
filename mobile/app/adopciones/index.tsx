import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { Heart, MapPin, Plus, Dog, Cat, PawPrint, LayoutGrid, List } from 'lucide-react-native';
import { useListings } from '@/src/hooks/adopciones/useListings';
import { useGridCell, useViewMode } from '@/src/hooks/useViewMode';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import ViewModeToggle from '@/src/components/ViewModeToggle';
import Badge from '@/src/components/Badge';
import { MediaCard, MediaRow, type MediaLine } from '@/src/components/MediaCard';
import { capitalize, getSpeciesLabel } from '@/src/utils/formatters';
import type { Listing } from '@/src/types/adopciones';
import { spacing, layout } from '@/constants/design';

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
    } = useListings();
    const [viewMode, setViewMode] = useViewMode<ListingViewMode>('adopciones', VIEW_MODES, 'grid');
    const isGrid = viewMode === 'grid';
    const gap = GAP[viewMode];
    const { columns, cellWidth } = useGridCell(gap);

    const hasActiveFilters = search.trim() !== '' || (!!speciesFilter && speciesFilter !== 'all') || (!!sizeFilter && sizeFilter !== 'all');

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
            <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Busca por nombre, raza..."
            />
            <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsContainer}>
                <FilterChip label="Todos" active={speciesFilter === 'all' && sizeFilter === 'all'} onPress={() => { setSpeciesFilter('all'); setSizeFilter('all'); }} />
                <FilterChip label="Perros" active={speciesFilter === 'perro'} onPress={() => setSpeciesFilter(speciesFilter === 'perro' ? 'all' : 'perro')} />
                <FilterChip label="Gatos" active={speciesFilter === 'gato'} onPress={() => setSpeciesFilter(speciesFilter === 'gato' ? 'all' : 'gato')} />
                <FilterChip label="Grandes" active={sizeFilter === 'grande'} onPress={() => setSizeFilter(sizeFilter === 'grande' ? 'all' : 'grande')} />
            </ScrollView>
            {listings.length > 0 && <ViewModeToggle value={viewMode} onChange={setViewMode} options={VIEW_OPTIONS} />}
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Adopciones"
                subtitle="Encuentra a tu nuevo mejor amigo"
                actionIcon={Plus}
                actionLabel="Publicar mascota"
                onAction={() => router.push('/adopciones/nuevo')}
            />

            <DataList
                data={listings}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                // Cambiar el número de columnas exige volver a montar la lista
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
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    filterSection: {
        marginTop: spacing.xs,
        marginBottom: spacing.md,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    chipsScroll: {
        flex: 1,
    },
    chipsContainer: {
        alignItems: 'center',
        gap: spacing.sm,
        paddingRight: spacing.xl,
    },
});
