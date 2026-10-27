import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useReports } from '@/src/hooks/perdidas/useReports';
import {
    Plus,
    ClipboardList,
    AlertCircle,
    CheckCircle2,
    Navigation,
    Wifi,
    Info,
    Map as MapIcon,
    LayoutGrid,
    List,
    SlidersHorizontal,
    X,
    Dog,
    Cat,
    PawPrint,
    Check,
} from 'lucide-react-native';
import WebMapView from '@/src/components/WebMapView';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import EmptyState from '@/src/components/EmptyState';
import StatTile from '@/src/components/StatTile';
import ViewModeToggle from '@/src/components/ViewModeToggle';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import BottomSheet from '@/src/components/BottomSheet';
import Button from '@/src/components/Button';
import { SkeletonGrid } from '@/src/components/Skeleton';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { ReportGridCard, ReportListRow } from '@/src/features/perdidas/ReportCard';
import { useGridCell } from '@/src/hooks/useViewMode';
import { layout, radius, spacing, tint, type, font, families } from '@/constants/design';

const VIEW_OPTIONS = [
    { value: 'grid' as const, label: 'Ver en cuadrícula', icon: LayoutGrid },
    { value: 'list' as const, label: 'Ver como lista', icon: List },
    { value: 'map' as const, label: 'Ver en el mapa', icon: MapIcon },
];

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
        setFilterType,
        toggleFilterType,
        filterSpecies,
        setFilterSpecies,
        toggleFilterSpecies,
        hasTrackerOnly,
        setHasTrackerOnly,
        clearFilters,
        activeFiltersCount,
        viewMode,
        setViewMode,
    } = useReports();
    const { cellWidth } = useGridCell(spacing.md);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const goToNew = () => router.push('/perdidas/nuevo');
    const hasFilters = searchQuery.trim() !== '' || activeFiltersCount > 0;

    const renderFeed = () => {
        if (isLoading) return <SkeletonGrid />;
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
            <View style={viewMode === 'grid' ? styles.grid : styles.list}>
                {filteredReports.map((report) => {
                    const open = () => router.push(`/perdidas/${report.id}`);
                    return viewMode === 'grid'
                        ? <ReportGridCard key={report.id} report={report} width={cellWidth} onPress={open} />
                        : <ReportListRow key={report.id} report={report} onPress={open} />;
                })}
            </View>
        );
    };

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false} refreshControl={<AppRefreshControl />}>
                <ScreenHeader
                    title="Mascotas perdidas"
                    subtitle="La comunidad te ayuda a reunirte con tu mejor amigo"
                    actions={[
                        { icon: ClipboardList, label: 'Mis reportes', onPress: () => router.push('/perdidas/mis-reportes') },
                        { icon: Plus, label: 'Reportar mascota', onPress: goToNew },
                    ]}
                />

                {/* Tarjetas resumen con contadores interactivos */}
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

                {/* Toolbar de Búsqueda Homologada con Botón de Filtros */}
                <View style={styles.toolbar}>
                    <View style={styles.searchRow}>
                        <View style={styles.searchContainer}>
                            <SearchBar
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Buscar por nombre, zona, raza..."
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

                    {/* Chips rápidos horizontales delgados */}
                    <View style={styles.quickFiltersWrapper}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.chipsScroll}
                            contentContainerStyle={styles.chipsContainer}
                        >
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
                            <FilterChip
                                label="Todos"
                                active={filterType === 'all' && filterSpecies === 'all' && !hasTrackerOnly}
                                onPress={clearFilters}
                            />
                            <FilterChip
                                label="Perros"
                                icon={<Dog size={14} color={filterSpecies === 'perro' ? theme.onPrimary : theme.warning} />}
                                active={filterSpecies === 'perro'}
                                onPress={() => toggleFilterSpecies('perro')}
                            />
                            <FilterChip
                                label="Gatos"
                                icon={<Cat size={14} color={filterSpecies === 'gato' ? theme.onPrimary : theme.accent} />}
                                active={filterSpecies === 'gato'}
                                onPress={() => toggleFilterSpecies('gato')}
                            />
                            <FilterChip
                                label="GPS en vivo"
                                icon={<Wifi size={14} color={hasTrackerOnly ? theme.onPrimary : theme.success} />}
                                active={hasTrackerOnly}
                                onPress={() => setHasTrackerOnly(!hasTrackerOnly)}
                            />
                        </ScrollView>
                        <View style={styles.viewToggleContainer}>
                            <ViewModeToggle value={viewMode} onChange={setViewMode} options={VIEW_OPTIONS} />
                        </View>
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

            {/* Modal Premium Homologado para Mascotas Perdidas */}
            <BottomSheet
                visible={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                title="Filtros de reportes"
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalSubHeader}>
                        <Text style={[styles.modalSubTitle, { color: theme.textMuted }]}>
                            Filtra reportes por situación, especie o localización
                        </Text>
                        {activeFiltersCount > 0 && (
                            <TouchableOpacity onPress={clearFilters} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Text style={[styles.modalResetText, { color: theme.primary }]}>Limpiar todo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Estado del reporte */}
                    <View style={styles.filterSectionGroup}>
                        <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Estado del reporte</Text>
                        <View style={styles.optionsGrid}>
                            {[
                                { key: 'all' as const, label: 'Todos los casos', desc: 'Perdidas y encontradas activas', icon: PawPrint, color: theme.primary },
                                { key: 'lost' as const, label: 'Mascotas perdidas', desc: 'Familias buscando a su mascota', icon: AlertCircle, color: theme.error },
                                { key: 'found' as const, label: 'Mascotas encontradas', desc: 'En resguardo temporal', icon: Navigation, color: theme.info },
                                { key: 'resolved' as const, label: 'Casos resueltos', desc: 'Mascotas ya reunidas con sus dueños', icon: CheckCircle2, color: theme.success },
                            ].map((item) => {
                                const isSelected = filterType === item.key;
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
                                        onPress={() => setFilterType(item.key)}
                                    >
                                        <View style={[styles.optionIconBox, { backgroundColor: isSelected ? item.color + '20' : theme.background }]}>
                                            <IconComponent size={18} color={isSelected ? item.color : theme.textMuted} />
                                        </View>
                                        <View style={styles.optionDetails}>
                                            <Text style={[styles.optionCardText, { color: isSelected ? theme.primary : theme.text, fontFamily: isSelected ? families.bold : families.medium }]}>
                                                {item.label}
                                            </Text>
                                            <Text style={[styles.optionCardSub, { color: theme.textMuted }]}>
                                                {item.desc}
                                            </Text>
                                        </View>
                                        <View style={[styles.radioIndicator, { borderColor: isSelected ? theme.primary : theme.border }]}>
                                            {isSelected && <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Especie */}
                    <View style={styles.filterSectionGroup}>
                        <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Especie</Text>
                        <View style={styles.optionsGrid}>
                            {[
                                { key: 'all', label: 'Cualquier especie', icon: PawPrint },
                                { key: 'perro', label: 'Perros', icon: Dog },
                                { key: 'gato', label: 'Gatos', icon: Cat },
                            ].map((item) => {
                                const isSelected = filterSpecies === item.key;
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
                                        onPress={() => setFilterSpecies(item.key)}
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

                    {/* Tecnología Rastreador */}
                    <View style={styles.filterSectionGroup}>
                        <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Tecnología Michi-Tracker</Text>
                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                {
                                    backgroundColor: hasTrackerOnly ? theme.success + '10' : theme.surface,
                                    borderColor: hasTrackerOnly ? theme.success : theme.border,
                                },
                            ]}
                            onPress={() => setHasTrackerOnly(!hasTrackerOnly)}
                        >
                            <View style={[styles.optionIconBox, { backgroundColor: hasTrackerOnly ? theme.success + '20' : theme.background }]}>
                                <Wifi size={18} color={hasTrackerOnly ? theme.success : theme.textMuted} />
                            </View>
                            <View style={styles.optionDetails}>
                                <Text style={[styles.optionCardText, { color: hasTrackerOnly ? theme.success : theme.text, fontFamily: families.bold }]}>
                                    Solo con collar GPS activo
                                </Text>
                                <Text style={[styles.optionCardSub, { color: theme.textMuted }]}>
                                    Muestran coordenadas y rastreo satelital en vivo
                                </Text>
                            </View>
                            <View style={[styles.checkboxIndicator, { borderColor: hasTrackerOnly ? theme.success : theme.border, backgroundColor: hasTrackerOnly ? theme.success : 'transparent' }]}>
                                {hasTrackerOnly && <Check size={12} color="#FFFFFF" />}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Footer con Botones */}
                    <View style={styles.modalFooter}>
                        <Button
                            label="Restablecer"
                            variant="secondary"
                            onPress={clearFilters}
                            style={styles.footerBtnHalf}
                        />
                        <Button
                            label={`Ver ${filteredReports.length} ${filteredReports.length === 1 ? 'reporte' : 'reportes'}`}
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
    stats: {
        flexDirection: 'row',
        gap: spacing.sm,
        paddingHorizontal: layout.screenPadding,
        marginBottom: spacing.sm,
    },
    toolbar: {
        paddingHorizontal: layout.screenPadding,
        marginBottom: spacing.sm,
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
    quickFiltersWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
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
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    list: { gap: spacing.sm },

    // Estilos del Modal
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
