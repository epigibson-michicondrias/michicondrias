import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useQuery } from '@tanstack/react-query';
import { getReports, LostPetReport } from '../../src/services/perdidas';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Search, Filter, Crosshair, Plus, AlertCircle, CheckCircle2, Navigation, Wifi, Info, Map as MapIcon, LayoutGrid, Clock, MapPin, ChevronLeft } from 'lucide-react-native';
// @ts-ignore
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PerdidasScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
    const [filterSpecies, setFilterSpecies] = useState('all');

    const { data: reports = [], isLoading } = useQuery({
        queryKey: ['lost-pet-reports', filterType, filterSpecies],
        queryFn: () => getReports(filterType === 'all' ? undefined : filterType),
    });

    const filteredReports = useMemo(() => {
        return reports.filter(r => {
            const matchesSpecies = filterSpecies === 'all' || r.species === filterSpecies;
            const matchesSearch = r.pet_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.last_seen_location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
            return matchesSpecies && matchesSearch;
        });
    }, [reports, searchQuery, filterSpecies]);

    const stats = useMemo(() => {
        return {
            lost: reports.filter(r => r.report_type === 'lost' && !r.is_resolved).length,
            found: reports.filter(r => r.report_type === 'found' && !r.is_resolved).length,
            reunited: reports.filter(r => r.is_resolved).length,
        };
    }, [reports]);

    const renderReportCard = (report: LostPetReport) => (
        <TouchableOpacity
            key={report.id}
            style={[styles.reportCard, { backgroundColor: theme.surface }]}
            onPress={() => router.push(`/perdidas/${report.id}`)}
        >
            <View style={styles.cardImageContainer}>
                <Image
                    source={{ uri: report.image_url || 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=400&auto=format&fit=crop' }}
                    style={styles.cardImage}
                />
                <View style={[styles.badge, { backgroundColor: report.report_type === 'lost' ? '#ef4444' : '#6366f1' }]}>
                    <Text style={styles.badgeText}>{report.report_type === 'lost' ? 'PERDIDA' : 'ENCONTRADA'}</Text>
                </View>
                {report.has_tracker && (
                    <View style={styles.trackerBadge}>
                        <Wifi size={10} color="#fff" />
                        <Text style={styles.trackerBadgeText}>GPS</Text>
                    </View>
                )}
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardName, { color: theme.text }]} numberOfLines={1}>{report.pet_name}</Text>
                <View style={styles.cardMeta}>
                    <MapPin size={12} color={theme.textMuted} />
                    <Text style={[styles.cardLocation, { color: theme.textMuted }]} numberOfLines={1}>
                        {report.last_seen_location}
                    </Text>
                </View>
                <View style={styles.cardFooter}>
                    <Text style={[styles.cardTime, { color: theme.textMuted }]}>Hace poco</Text>
                    {report.is_resolved && (
                        <View style={styles.resolvedTag}>
                            <CheckCircle2 size={12} color="#10b981" />
                            <Text style={styles.resolvedText}>REUNIDO</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header / Premium Portal */}
            <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[2]}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <ChevronLeft size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.screenTitle, { color: theme.text }]}>Mascotas Perdidas</Text>
                        <TouchableOpacity style={styles.plusBtn} onPress={() => router.push('/perdidas/nuevo')}>
                            <Plus size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.screenSubtitle, { color: theme.textMuted }]}>La comunidad Michicondrias te ayuda a reunirte con tu mejor amigo.</Text>
                </View>

                {/* Stats Strip */}
                <View style={styles.statsStrip}>
                    <View style={[styles.statItem, { backgroundColor: '#ef444415' }]}>
                        <AlertCircle size={20} color="#ef4444" />
                        <View>
                            <Text style={[styles.statVal, { color: '#ef4444' }]}>{stats.lost}</Text>
                            <Text style={styles.statLabel}>Perdidas</Text>
                        </View>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: '#6366f115' }]}>
                        <Navigation size={20} color="#6366f1" />
                        <View>
                            <Text style={[styles.statVal, { color: '#6366f1' }]}>{stats.found}</Text>
                            <Text style={styles.statLabel}>Encontradas</Text>
                        </View>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: '#10b98115' }]}>
                        <CheckCircle2 size={20} color="#10b981" />
                        <View>
                            <Text style={[styles.statVal, { color: '#10b981' }]}>{stats.reunited}</Text>
                            <Text style={styles.statLabel}>Reunidos</Text>
                        </View>
                    </View>
                </View>

                {/* Premium Banner Debug: Replaced LinearGradient with View */}
                <View
                    style={[styles.premiumBanner, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}
                >
                    <View style={styles.premiumTextContainer}>
                        <View style={styles.membershipBadge}>
                            <View style={styles.pulseDot} />
                            <Text style={styles.membershipText}>MICHI-TRACKER PRO</Text>
                        </View>
                        <Text style={styles.premiumTitle}>Localización en Tiempo Real</Text>
                        <Text style={styles.premiumDesc}>Adquiere el collar GPS y nunca pierdas de vista a tu mejor amigo.</Text>
                    </View>
                    <TouchableOpacity style={styles.premiumBtn}>
                        <Wifi size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Toolbar / Search */}
                <View style={[styles.toolbar, { backgroundColor: theme.background }]}>
                    <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
                        <Search size={18} color={theme.textMuted} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.text }]}
                            placeholder="Buscar por nombre o zona..."
                            placeholderTextColor={theme.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <View style={styles.actionRow}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                            <TouchableOpacity
                                style={[styles.filterChip, filterType === 'all' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                onPress={() => setFilterType('all')}
                            >
                                <Text style={[styles.filterText, filterType === 'all' && { color: '#fff' }]}>Todos</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterChip, filterType === 'lost' && { backgroundColor: '#ef4444', borderColor: '#ef4444' }]}
                                onPress={() => setFilterType('lost')}
                            >
                                <Text style={[styles.filterText, filterType === 'lost' && { color: '#fff' }]}>🚨 Perdidas</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterChip, filterType === 'found' && { backgroundColor: '#6366f1', borderColor: '#6366f1' }]}
                                onPress={() => setFilterType('found')}
                            >
                                <Text style={[styles.filterText, filterType === 'found' && { color: '#fff' }]}>🐾 Encontradas</Text>
                            </TouchableOpacity>
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />
                            <TouchableOpacity
                                style={[styles.filterChip, filterSpecies === 'perro' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                onPress={() => setFilterSpecies(filterSpecies === 'perro' ? 'all' : 'perro')}
                            >
                                <Text style={[styles.filterText, filterSpecies === 'perro' && { color: '#fff' }]}>🐕 Perros</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterChip, filterSpecies === 'gato' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                onPress={() => setFilterSpecies(filterSpecies === 'gato' ? 'all' : 'gato')}
                            >
                                <Text style={[styles.filterText, filterSpecies === 'gato' && { color: '#fff' }]}>🐈 Gatos</Text>
                            </TouchableOpacity>
                        </ScrollView>
                        <TouchableOpacity style={[styles.viewToggle, { backgroundColor: theme.surface }]} onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}>
                            {viewMode === 'map' ? <LayoutGrid size={20} color={theme.text} /> : <MapIcon size={20} color={theme.text} />}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content Area */}
                {viewMode === 'map' ? (
                    <View style={[styles.mapContainer, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.surface }]}>
                        <MapPin size={48} color={theme.textMuted} />
                        <Text style={{ color: theme.textMuted, marginTop: 16, fontWeight: '700' }}>Mapa en mantenimiento</Text>
                        <Text style={{ color: theme.textMuted, fontSize: 12 }}>(Falta Google Maps API Key en Android)</Text>
                    </View>
                ) : (
                    <View style={styles.feed}>
                        {isLoading ? (
                            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                        ) : filteredReports.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Info size={48} color={theme.textMuted} />
                                <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay reportes activos con estos filtros.</Text>
                            </View>
                        ) : (
                            <View style={styles.reportsGrid}>
                                {filteredReports.map(renderReportCard)}
                            </View>
                        )}
                    </View>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floatings */}
            <TouchableOpacity
                style={[styles.mainFab, { backgroundColor: '#ef4444' }]}
                onPress={() => router.push('/perdidas/nuevo')}
            >
                <Plus size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const mapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
    { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
    { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
    { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
    { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
    { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
    { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    plusBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: '900',
    },
    screenSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    statsStrip: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 24,
    },
    statItem: {
        flex: 1,
        borderRadius: 20,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statVal: {
        fontSize: 16,
        fontWeight: '900',
    },
    statLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '700',
    },
    premiumBanner: {
        marginHorizontal: 24,
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
        marginBottom: 32,
    },
    premiumTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    membershipBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: 'rgba(52, 211, 153, 0.2)',
        alignSelf: 'flex-start',
        marginBottom: 8,
        gap: 6,
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#34d399',
    },
    membershipText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#34d399',
    },
    premiumTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    premiumDesc: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 16,
    },
    premiumBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5,
    },
    toolbar: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        zIndex: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 54,
        borderRadius: 18,
        gap: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    filterScroll: {
        flexDirection: 'row',
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    filterText: {
        fontSize: 12,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.5)',
    },
    divider: {
        width: 1,
        height: 20,
        alignSelf: 'center',
        marginHorizontal: 4,
    },
    viewToggle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    mapContainer: {
        height: 500,
        width: width,
    },
    map: {
        flex: 1,
    },
    markerBase: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 3,
        backgroundColor: '#fff',
        padding: 2,
        overflow: 'visible',
    },
    markerImg: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    markerPulse: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: '#fff',
    },
    feed: {
        padding: 20,
    },
    reportsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    reportCard: {
        width: (width - 56) / 2,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardImageContainer: {
        height: 140,
        width: '100%',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    badge: {
        position: 'absolute',
        top: 10,
        left: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#fff',
    },
    trackerBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#10b981',
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trackerBadgeText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#fff',
    },
    cardContent: {
        padding: 12,
    },
    cardName: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    cardLocation: {
        fontSize: 11,
        flex: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTime: {
        fontSize: 10,
        fontWeight: '600',
    },
    resolvedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    resolvedText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#10b981',
    },
    mainFab: {
        position: 'absolute',
        bottom: 40,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 14,
        fontWeight: '600',
    }
});
