import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Linking, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReportById, LostPetReport, resolveReport } from '../../src/services/perdidas';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, MapPin, Phone, Clock, AlertTriangle, Crosshair, Wifi, Battery, Navigation, Share2, Heart, CheckCircle2, User, Info, Scale, Fingerprint, Calendar } from 'lucide-react-native';
// @ts-ignore
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function PerdidasDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const { data: report, isLoading, error } = useQuery({
        queryKey: ['perdidas-report', id],
        queryFn: () => getReportById(id?.toString() || ''),
        enabled: !!id,
        refetchInterval: (query) => (query.state.data?.has_tracker ? 5000 : false),
    });

    const resolveMutation = useMutation({
        mutationFn: () => resolveReport(id?.toString() || ''),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['perdidas-report', id] });
            Alert.alert("¡Felicidades!", "Nos alegra mucho que este michi haya regresado a casa. ❤️");
        }
    });

    if (isLoading) return (
        <View style={[styles.center, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textMuted }]}>Localizando michi...</Text>
        </View>
    );

    if (error || !report) return (
        <View style={[styles.center, { backgroundColor: theme.background }]}>
            <AlertTriangle size={48} color={theme.error} />
            <Text style={{ color: theme.error, marginTop: 16 }}>Error al cargar el reporte</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Text style={{ color: '#fff' }}>Regresar</Text>
            </TouchableOpacity>
        </View>
    );

    const isOwner = user?.id === report.reporter_id;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.hero}>
                    <Image
                        source={{ uri: report.image_url || 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=800' }}
                        style={styles.heroImage}
                    />
                    {/* Hero Overlay Debug: Replaced LinearGradient with View */}
                    <View
                        style={[styles.heroOverlay, { backgroundColor: 'rgba(15, 23, 42, 0.4)' }]}
                    />

                    <TouchableOpacity style={styles.floatingBack} onPress={() => router.back()}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.heroContent}>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, { backgroundColor: report.report_type === 'lost' ? '#ef4444' : '#6366f1' }]}>
                                <Text style={styles.statusText}>{report.report_type === 'lost' ? 'PERDIDO' : 'ENCONTRADO'}</Text>
                            </View>
                            {report.is_resolved && (
                                <View style={[styles.statusBadge, { backgroundColor: '#10b981' }]}>
                                    <CheckCircle2 size={12} color="#fff" />
                                    <Text style={styles.statusText}>REUNIDO</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.petName}>{report.pet_name}</Text>
                        <View style={styles.lastSeenRow}>
                            <MapPin size={16} color="#cbd5e1" />
                            <Text style={styles.lastSeenText}>{report.last_seen_location}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.body}>
                    {!report.is_resolved && report.report_type === 'lost' && (
                        <View style={[styles.alertCard, { backgroundColor: '#ef444410', borderColor: '#ef444430' }]}>
                            <AlertTriangle size={20} color="#ef4444" />
                            <Text style={[styles.alertText, { color: '#f87171' }]}>
                                Búsqueda activa. Cualquier información es vital.
                            </Text>
                        </View>
                    )}

                    <View style={styles.grid}>
                        <View style={[styles.gridItem, { backgroundColor: theme.surface }]}>
                            <Fingerprint size={18} color={theme.primary} />
                            <View>
                                <Text style={styles.gridLabel}>Raza</Text>
                                <Text style={[styles.gridValue, { color: theme.text }]}>{report.breed || 'Mestizo'}</Text>
                            </View>
                        </View>
                        <View style={[styles.gridItem, { backgroundColor: theme.surface }]}>
                            <Info size={18} color={theme.primary} />
                            <View>
                                <Text style={styles.gridLabel}>Color</Text>
                                <Text style={[styles.gridValue, { color: theme.text }]}>{report.color || 'No especificado'}</Text>
                            </View>
                        </View>
                        <View style={[styles.gridItem, { backgroundColor: theme.surface }]}>
                            <Scale size={18} color={theme.primary} />
                            <View>
                                <Text style={styles.gridLabel}>Tamaño</Text>
                                <Text style={[styles.gridValue, { color: theme.text }]}>{report.size || 'Mediano'}</Text>
                            </View>
                        </View>
                        <View style={[styles.gridItem, { backgroundColor: theme.surface }]}>
                            <Calendar size={18} color={theme.primary} />
                            <View>
                                <Text style={styles.gridLabel}>Edad aprox.</Text>
                                <Text style={[styles.gridValue, { color: theme.text }]}>{report.age_approx || 'Joven'}</Text>
                            </View>
                        </View>
                    </View>

                    {report.has_tracker && (
                        <LinearGradient
                            colors={['rgba(34, 197, 94, 0.15)', 'rgba(16, 185, 129, 0.05)']}
                            style={styles.trackerCard}
                        >
                            <View style={styles.trackerHeader}>
                                <View style={styles.trackerTitleRow}>
                                    <Wifi size={24} color="#22c55e" />
                                    <Text style={styles.trackerTitle}>Michi-Tracker Live</Text>
                                </View>
                                <View style={styles.liveBadge}>
                                    <View style={styles.liveDot} />
                                    <Text style={styles.liveText}>CONECTADO</Text>
                                </View>
                            </View>

                            <View style={styles.trackerMetrics}>
                                <View style={styles.metric}>
                                    <Battery size={20} color={theme.textMuted} />
                                    <View>
                                        <Text style={styles.metricLabel}>BATERÍA</Text>
                                        <Text style={[styles.metricValue, { color: theme.text }]}>84%</Text>
                                    </View>
                                </View>
                                <View style={styles.metric}>
                                    <Navigation size={20} color={theme.textMuted} />
                                    <View>
                                        <Text style={styles.metricLabel}>VELOCIDAD</Text>
                                        <Text style={[styles.metricValue, { color: theme.text }]}>1.2 km/h</Text>
                                    </View>
                                </View>
                                <View style={styles.metric}>
                                    <Clock size={20} color={theme.textMuted} />
                                    <View>
                                        <Text style={styles.metricLabel}>ACTUALIZADO</Text>
                                        <Text style={[styles.metricValue, { color: theme.text }]}>Ahora</Text>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    )}

                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Descripción y Señas</Text>
                    <Text style={[styles.descriptionText, { color: theme.textMuted }]}>
                        {report.description || `Se busca a ${report.pet_name}. Visto por última vez en ${report.last_seen_location}. Es muy amigable pero puede estar asustado. Por favor, si lo ves, contacta de inmediato.`}
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Última Ubicación Conocida</Text>
                    <View style={styles.mapWrapper}>
                        <MapView
                            provider={PROVIDER_DEFAULT}
                            style={styles.map}
                            initialRegion={{
                                latitude: report.latitude || 19.4326,
                                longitude: report.longitude || -99.1332,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            scrollEnabled={false}
                            zoomEnabled={false}
                            mapType="none"
                        >
                            <UrlTile
                                urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                maximumZ={19}
                                flipY={false}
                            />
                            <Marker
                                coordinate={{
                                    latitude: report.latitude || 19.4326,
                                    longitude: report.longitude || -99.1332,
                                }}
                            >
                                <View style={[styles.miniMarker, { borderColor: report.report_type === 'lost' ? '#ef4444' : '#6366f1' }]}>
                                    <Image
                                        source={{ uri: report.image_url || 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=400' }}
                                        style={styles.miniMarkerImg}
                                    />
                                </View>
                            </Marker>
                        </MapView>
                    </View>

                    {isOwner && !report.is_resolved && (
                        <TouchableOpacity
                            style={[styles.resolveBtn, { backgroundColor: '#10b981' }]}
                            onPress={() => {
                                Alert.alert(
                                    "¿Ya regresó a casa?",
                                    "Esto marcará el reporte como RESUELTO y se notificará a la comunidad.",
                                    [
                                        { text: "Cancelar", style: "cancel" },
                                        { text: "¡SÍ, YA REGRESÓ!", onPress: () => resolveMutation.mutate() }
                                    ]
                                );
                            }}
                        >
                            <CheckCircle2 size={24} color="#fff" />
                            <Text style={styles.resolveBtnText}>Marcar como Reunido</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
                <View style={styles.footerActions}>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surface }]}>
                        <Heart size={24} color={theme.error} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surface }]}>
                        <Share2 size={24} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.callBtn, { backgroundColor: report.report_type === 'lost' ? '#ef4444' : '#6366f1' }]}
                        onPress={() => Linking.openURL(`tel:${report.contact_phone || '5551234567'}`)}
                    >
                        <Phone size={20} color="#fff" />
                        <Text style={styles.callText}>Contactar</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
    },
    hero: {
        width: '100%',
        height: 480,
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    floatingBack: {
        position: 'absolute',
        top: 60,
        left: 24,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    heroContent: {
        position: 'absolute',
        bottom: 30,
        left: 24,
        right: 24,
    },
    statusRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
    },
    petName: {
        fontSize: 42,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -1,
        marginBottom: 4,
    },
    lastSeenRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    lastSeenText: {
        color: '#cbd5e1',
        fontSize: 14,
        fontWeight: '500',
    },
    body: {
        padding: 24,
    },
    alertCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        gap: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    alertText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '700',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 32,
    },
    gridItem: {
        width: (width - 60) / 2,
        padding: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    gridLabel: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: '700',
        marginBottom: 2,
    },
    gridValue: {
        fontSize: 13,
        fontWeight: '800',
    },
    trackerCard: {
        padding: 24,
        borderRadius: 28,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    trackerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    trackerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    trackerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#22c55e',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        gap: 6,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#22c55e',
    },
    liveText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#22c55e',
    },
    trackerMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metric: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    metricLabel: {
        fontSize: 8,
        color: '#64748b',
        fontWeight: '800',
    },
    metricValue: {
        fontSize: 14,
        fontWeight: '900',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 32,
    },
    mapWrapper: {
        height: 200,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 4,
        marginBottom: 32,
    },
    map: {
        flex: 1,
    },
    miniMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    miniMarkerImg: {
        width: '100%',
        height: '100%',
    },
    resolveBtn: {
        height: 64,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    resolveBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    footerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconBtn: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    callBtn: {
        flex: 1,
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    callText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    backBtn: {
        marginTop: 20,
        backgroundColor: '#1e293b',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
});
