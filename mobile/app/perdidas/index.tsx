import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useReports } from '@/src/hooks/perdidas';
import { getTimeAgo } from '@/src/utils/formatters';
import type { LostPetReport } from '@/src/types/perdidas';
import { Plus, AlertCircle, CheckCircle2, Navigation, Wifi, Info, Map as MapIcon, LayoutGrid, MapPin, Clock } from 'lucide-react-native';
import WebMapView from '../../src/components/WebMapView';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import EmptyState from '@/src/components/EmptyState';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import { StatusBar } from 'expo-status-bar';
// @ts-ignore
import { LinearGradient } from 'expo-linear-gradient';
import BackButton from '@/src/components/BackButton';

const { width } = Dimensions.get('window');

export default function PerdidasScreen() {
    const router = useRouter();
    const { theme, isDark } = useTheme();
    const {
        filteredReports,
        stats,
        mapMarkers,
        isLoading,
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        filterSpecies,
        toggleFilterSpecies,
        viewMode,
        toggleViewMode,
    } = useReports();

    const getLocalTimeAgo = (dateStr: string | null) => {
        if (!dateStr) return 'Reciente';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `Hace ${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `Hace ${hrs}h`;
        return `Hace ${Math.floor(hrs / 24)}d`;
    };

    const renderReportCard = (report: LostPetReport) => (
        <TouchableOpacity
            key={report.id}
            style={[styles.reportCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={() => router.push(`/perdidas/${report.id}`)}
            activeOpacity={0.85}
        >
            <View style={styles.cardImageContainer}>
                <Image
                    source={{ uri: report.image_url || 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=400&auto=format&fit=crop' }}
                    style={styles.cardImage}
                />
                <View style={[styles.badge, {
                    backgroundColor: report.report_type === 'lost' ? theme.error : '#6366f1'
                }]}>
                    <Text style={styles.badgeText}>
                        {report.report_type === 'lost' ? 'PERDIDA' : 'ENCONTRADA'}
                    </Text>
                </View>
                {report.has_tracker && (
                    <View style={[styles.trackerBadge, { backgroundColor: theme.success }]}>
                        <Wifi size={10} color="#fff" />
                        <Text style={styles.trackerBadgeText}>GPS</Text>
                    </View>
                )}
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardName, { color: theme.text }]} numberOfLines={1}>{report.pet_name}</Text>
                <View style={styles.cardMeta}>
                    <MapPin size={11} color={theme.textMuted} />
                    <Text style={[styles.cardLocation, { color: theme.textMuted }]} numberOfLines={1}>
                        {report.last_seen_location || 'Sin ubicación'}
                    </Text>
                </View>
                <View style={styles.cardFooter}>
                    <View style={styles.cardTimeRow}>
                        <Clock size={10} color={theme.textMuted} />
                        <Text style={[styles.cardTime, { color: theme.textMuted }]}>{getLocalTimeAgo(report.created_at)}</Text>
                    </View>
                    {report.is_resolved && (
                        <View style={[styles.resolvedTag, { backgroundColor: theme.successLight }]}>
                            <CheckCircle2 size={10} color={theme.success} />
                            <Text style={[styles.resolvedText, { color: theme.success }]}>Reunido</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#081a2e' : '#f0f9ff' }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <LinearGradient
                colors={isDark ? ['#ef4444', '#081a2e'] : ['#fecaca', '#f0f9ff']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.25 }}
            />

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <BackButton
                            onPress={() => router.back()}
                        />
                        <Text style={[styles.screenTitle, { color: isDark ? '#fff' : '#7f1d1d' }]}>Mascotas Perdidas</Text>
                        <TouchableOpacity
                            style={[styles.plusBtn, { backgroundColor: theme.error }]}
                            onPress={() => router.push('/perdidas/nuevo')}
                        >
                            <Plus size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.screenSubtitle, { color: isDark ? 'rgba(255,255,255,0.6)' : '#991b1b' }]}>
                        La comunidad te ayuda a reunirte con tu mejor amigo
                    </Text>
                </View>

                {/* Stats */}
                <View style={styles.statsStrip}>
                    <View style={[styles.statItem, { backgroundColor: theme.errorLight, borderColor: theme.error + '20' }]}>
                        <AlertCircle size={18} color={theme.error} />
                        <View>
                            <Text style={[styles.statVal, { color: theme.error }]}>{stats.lost}</Text>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Perdidas</Text>
                        </View>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: theme.infoLight, borderColor: theme.info + '20' }]}>
                        <Navigation size={18} color={theme.info} />
                        <View>
                            <Text style={[styles.statVal, { color: theme.info }]}>{stats.found}</Text>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Encontradas</Text>
                        </View>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: theme.successLight, borderColor: theme.success + '20' }]}>
                        <CheckCircle2 size={18} color={theme.success} />
                        <View>
                            <Text style={[styles.statVal, { color: theme.success }]}>{stats.reunited}</Text>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Reunidos</Text>
                        </View>
                    </View>
                </View>

                {/* Michi-Tracker Banner */}
                <View style={[styles.trackerBanner, { backgroundColor: theme.successLight, borderColor: theme.success + '30' }]}>
                    <View style={styles.trackerContent}>
                        <View style={[styles.trackerIcon, { backgroundColor: theme.success + '20' }]}>
                            <Wifi size={20} color={theme.success} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.trackerTitle, { color: theme.success }]}>Michi-Tracker Pro</Text>
                            <Text style={[styles.trackerDesc, { color: theme.textMuted }]}>GPS en tiempo real para tu mascota</Text>
                        </View>
                    </View>
                </View>

                {/* Search + Filters */}
                <View style={styles.toolbar}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Buscar por nombre o zona..."
                    />

                    <View style={styles.filterRow}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                            {[
                                { key: 'all', label: 'Todos', color: theme.primary },
                                { key: 'lost', label: 'Perdidas', color: theme.error },
                                { key: 'found', label: 'Encontradas', color: theme.info },
                                { key: 'divider' },
                                { key: 'perro', label: 'Perros' },
                                { key: 'gato', label: 'Gatos' },
                            ].map((f) => {
                                if (f.key === 'divider') return (
                                    <View key="divider" style={[styles.filterDivider, { backgroundColor: theme.border }]} />
                                );
                                const isActive = filterType === f.key || filterSpecies === f.key;
                                return (
                                    <FilterChip
                                        key={f.key}
                                        label={f.label!}
                                        active={isActive}
                                        color={f.color}
                                        onPress={() => {
                                            if (f.key === 'perro' || f.key === 'gato') {
                                                toggleFilterSpecies(f.key);
                                            } else {
                                                setFilterType(f.key as any);
                                            }
                                        }}
                                    />
                                );
                            })}
                        </ScrollView>
                        <TouchableOpacity
                            style={[styles.viewToggle, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            onPress={toggleViewMode}
                        >
                            {viewMode === 'map' ? <LayoutGrid size={18} color={theme.text} /> : <MapIcon size={18} color={theme.text} />}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                {viewMode === 'map' ? (
                    <View style={styles.mapContainer}>
                        <WebMapView
                            style={styles.map}
                            markers={mapMarkers.map(m => ({
                                ...m,
                                color: m.reportType === 'lost' ? theme.error : theme.info,
                            }))}
                            onMarkerPress={(id) => router.push(`/perdidas/${id}`)}
                        />
                    </View>
                ) : (
                    <View style={styles.feed}>
                        {isLoading ? (
                            <LoadingOverlay />
                        ) : filteredReports.length === 0 ? (
                            <EmptyState
                                icon={<Info size={32} color={theme.textMuted} />}
                                title="Sin reportes"
                                subtitle="No hay reportes con estos filtros."
                            />
                        ) : (
                            <View style={styles.reportsGrid}>
                                {filteredReports.map(renderReportCard)}
                            </View>
                        )}
                    </View>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 8 },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    plusBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    screenTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
    screenSubtitle: { fontSize: 14, fontWeight: '500' },
    statsStrip: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 10,
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        borderRadius: 16,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
    },
    statVal: { fontSize: 20, fontWeight: '900' },
    statLabel: { fontSize: 11, fontWeight: '700', marginTop: 2 },
    trackerBanner: {
        marginHorizontal: 24,
        marginBottom: 16,
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
    },
    trackerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    trackerIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackerTitle: { fontSize: 14, fontWeight: '800' },
    trackerDesc: { fontSize: 12, fontWeight: '500', marginTop: 2 },
    toolbar: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    filterScroll: { flexDirection: 'row', gap: 8 },
    filterDivider: { width: 1, height: 20, marginHorizontal: 4 },
    viewToggle: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    },
    mapContainer: { height: 500, width: width },
    map: { flex: 1 },
    feed: { paddingHorizontal: 20 },
    reportsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    reportCard: {
        width: (width - 52) / 2,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
    },
    cardImageContainer: { height: 130, width: '100%' },
    cardImage: { width: '100%', height: '100%' },
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    badgeText: { fontSize: 9, fontWeight: '900', color: '#fff' },
    trackerBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    trackerBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff' },
    cardContent: { padding: 12 },
    cardName: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
    cardLocation: { fontSize: 11, flex: 1, fontWeight: '500' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardTime: { fontSize: 10, fontWeight: '600' },
    resolvedTag: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    resolvedText: { fontSize: 9, fontWeight: '800' },
});
