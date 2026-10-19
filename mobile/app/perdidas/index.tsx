import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useReports } from '@/src/hooks/perdidas/useReports';
import { Plus, AlertCircle, CheckCircle2, Navigation, Wifi, Info, Map as MapIcon, LayoutGrid } from 'lucide-react-native';
import WebMapView from '@/src/components/WebMapView';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import EmptyState from '@/src/components/EmptyState';
import StatTile from '@/src/components/StatTile';
import IconButton from '@/src/components/IconButton';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { SkeletonGrid } from '@/src/components/Skeleton';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import ReportCard from '@/src/features/perdidas/ReportCard';
import { layout, radius, spacing, tint, type } from '@/constants/design';

const SPECIES_FILTERS = [
    { key: 'perro', label: 'Perros' },
    { key: 'gato', label: 'Gatos' },
] as const;

export default function PerdidasScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        filteredReports,
        stats,
        mapMarkers,
        isLoading,
        isError,
        reports,
        searchQuery,
        setSearchQuery,
        filterType,
        toggleFilterType,
        filterSpecies,
        toggleFilterSpecies,
        clearFilters,
        viewMode,
        toggleViewMode,
    } = useReports();

    const goToNew = () => router.push('/perdidas/nuevo');
    const hasFilters = filterType !== 'all' || filterSpecies !== 'all' || searchQuery.length > 0;

    const renderFeed = () => {
        if (isLoading) return <SkeletonGrid />;
        // El error con reintentar lo muestra el aviso de ScreenContainer; aquí solo se explica el hueco
        if (isError && reports.length === 0) {
            return (
                <EmptyState
                    icon={<AlertCircle size={layout.icon.xl} color={theme.textMuted} />}
                    title="No pudimos cargar los reportes"
                    subtitle="Revisa tu conexión e inténtalo de nuevo."
                />
            );
        }
        if (filteredReports.length === 0) {
            return hasFilters ? (
                <EmptyState
                    icon={<Info size={layout.icon.xl} color={theme.textMuted} />}
                    title="Sin resultados"
                    subtitle="No hay reportes con estos filtros."
                    actionLabel="Quitar filtros"
                    onAction={clearFilters}
                />
            ) : (
                <EmptyState
                    icon={<Info size={layout.icon.xl} color={theme.textMuted} />}
                    title="Sin reportes activos"
                    subtitle="Por ahora no hay mascotas perdidas ni encontradas. Si ves o pierdes una, repórtala."
                    actionLabel="Reportar una mascota"
                    onAction={goToNew}
                />
            );
        }
        return (
            <View style={styles.grid}>
                {filteredReports.map((report) => (
                    <ReportCard key={report.id} report={report} onPress={() => router.push(`/perdidas/${report.id}`)} />
                ))}
            </View>
        );
    };

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false} refreshControl={<AppRefreshControl />}>
                <ScreenHeader
                    title="Mascotas perdidas"
                    subtitle="La comunidad te ayuda a reunirte con tu mejor amigo"
                    actions={[{ icon: Plus, label: 'Reportar mascota', onPress: goToNew }]}
                />

                {/* Cifras: también son el filtro por tipo */}
                <View style={styles.stats}>
                    <StatTile
                        icon={AlertCircle}
                        value={stats.lost}
                        label="Perdidas"
                        color={theme.error}
                        active={filterType === 'lost'}
                        onPress={() => toggleFilterType('lost')}
                    />
                    <StatTile
                        icon={Navigation}
                        value={stats.found}
                        label="Encontradas"
                        color={theme.info}
                        active={filterType === 'found'}
                        onPress={() => toggleFilterType('found')}
                    />
                    <StatTile
                        icon={CheckCircle2}
                        value={stats.reunited}
                        label="Reunidos"
                        color={theme.success}
                        active={filterType === 'resolved'}
                        onPress={() => toggleFilterType('resolved')}
                    />
                </View>

                <View style={styles.toolbar}>
                    <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Buscar por nombre o zona..." />
                    <View style={styles.filterRow}>
                        <View style={styles.chips}>
                            {SPECIES_FILTERS.map((f) => (
                                <FilterChip
                                    key={f.key}
                                    label={f.label}
                                    active={filterSpecies === f.key}
                                    onPress={() => toggleFilterSpecies(f.key)}
                                />
                            ))}
                        </View>
                        <IconButton
                            icon={viewMode === 'map' ? LayoutGrid : MapIcon}
                            accessibilityLabel={viewMode === 'map' ? 'Ver como lista' : 'Ver en el mapa'}
                            onPress={toggleViewMode}
                            variant="surface"
                        />
                    </View>
                </View>

                {viewMode === 'map' ? (
                    <View style={styles.mapSection}>
                        <View style={[styles.trackerNote, { backgroundColor: theme.success + tint.faint, borderColor: theme.success + tint.medium }]}>
                            <Wifi size={layout.icon.sm} color={theme.success} />
                            <Text style={[type.caption, styles.flex, { color: theme.textMuted }]}>
                                Los reportes con collar GPS muestran su posición en tiempo real.
                            </Text>
                        </View>
                        {mapMarkers.length === 0 && !isLoading && (
                            <Text style={[type.body, styles.mapEmpty, { color: theme.textMuted }]}>
                                Ningún reporte tiene ubicación para mostrar en el mapa.
                            </Text>
                        )}
                        <WebMapView
                            style={styles.map}
                            markers={mapMarkers.map((m) => ({
                                ...m,
                                color: filterType === 'resolved' ? theme.success : m.reportType === 'lost' ? theme.error : theme.info,
                            }))}
                            onMarkerPress={(id) => router.push(`/perdidas/${id}`)}
                        />
                    </View>
                ) : (
                    <View style={styles.feed}>{renderFeed()}</View>
                )}
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    stats: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingHorizontal: layout.screenPadding,
        marginBottom: spacing.md,
    },
    toolbar: {
        paddingHorizontal: layout.screenPadding,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
    chips: { flexDirection: 'row', gap: spacing.sm },
    mapSection: { gap: spacing.md, paddingBottom: spacing.huge },
    trackerNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginHorizontal: layout.screenPadding,
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    flex: { flex: 1 },
    mapEmpty: { textAlign: 'center' },
    map: { height: 500, width: '100%' },
    feed: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.huge * 2 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
});
