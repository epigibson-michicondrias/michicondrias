import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { Plus, PawPrint, LayoutGrid, List, GalleryVertical } from 'lucide-react-native';
import { usePets } from '@/src/hooks/mascotas/usePets';
import { useGridCell, useViewMode } from '@/src/hooks/useViewMode';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import ViewModeToggle from '@/src/components/ViewModeToggle';
import { PetDetailCard, PetGridCard, PetListRow } from '@/src/features/mascotas/PetCards';
import type { Pet } from '@/src/types/mascotas';
import { spacing, type, layout } from '@/constants/design';

const VIEW_MODES = ['grid', 'list', 'cards'] as const;
type PetViewMode = (typeof VIEW_MODES)[number];

const VIEW_OPTIONS = [
    { value: 'grid' as const, label: 'Ver en cuadrícula', icon: LayoutGrid },
    { value: 'list' as const, label: 'Ver como lista', icon: List },
    { value: 'cards' as const, label: 'Ver como tarjetas', icon: GalleryVertical },
];

/** Separación entre elementos según la forma de ver. */
const GAP: Record<PetViewMode, number> = { grid: spacing.md, list: spacing.sm, cards: spacing.lg };

export default function MascotasListScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { pets, isLoading, isRefetching, refetch } = usePets();
    const [viewMode, setViewMode] = useViewMode<PetViewMode>('mascotas', VIEW_MODES, 'grid');
    const isGrid = viewMode === 'grid';
    const gap = GAP[viewMode];
    const { columns, cellWidth } = useGridCell(gap);

    const goToPet = (pet: Pet) => () => router.push(`/mascotas/${pet.id}`);
    const goToNew = () => router.push('/mascotas/nuevo');

    const renderItem = ({ item }: { item: Pet }) => {
        if (viewMode === 'grid') return <PetGridCard pet={item} width={cellWidth} onPress={goToPet(item)} />;
        if (viewMode === 'list') return <PetListRow pet={item} onPress={goToPet(item)} />;
        return <PetDetailCard pet={item} onPress={goToPet(item)} onEdit={() => router.push(`/mascotas/editar/${item.id}`)} />;
    };

    const toolbar = (
        <View style={styles.toolbar}>
            <Text style={[type.caption, styles.count, { color: theme.textMuted }]}>
                {pets.length} {pets.length === 1 ? 'mascota' : 'mascotas'}
            </Text>
            <ViewModeToggle value={viewMode} onChange={setViewMode} options={VIEW_OPTIONS} />
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader title="Mis Mascotas" actionIcon={Plus} actionLabel="Agregar mascota" onAction={goToNew} />

            <DataList
                // Cambiar el número de columnas exige volver a montar la lista
                key={isGrid ? `grid-${columns}` : viewMode}
                data={pets}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={isGrid ? columns : 1}
                columnWrapperStyle={isGrid ? { gap } : undefined}
                ItemSeparatorComponent={() => <View style={{ height: gap }} />}
                header={pets.length > 0 ? toolbar : undefined}
                isLoading={isLoading}
                skeleton
                onRefresh={refetch}
                isRefreshing={isRefetching}
                emptyIcon={<PawPrint size={layout.icon.xl} color={theme.textMuted} />}
                emptyTitle="Aún no tienes mascotas"
                emptySubtitle="Agrega a tu perro o gato para llevar su control, carnet y tracker."
                emptyActionLabel="Agregar mascota"
                onEmptyAction={goToNew}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    count: { fontWeight: '700' },
});
