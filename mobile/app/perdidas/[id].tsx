import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView, Dimensions, ActivityIndicator, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import WebMapView, { MapMarker } from '../../src/components/WebMapView';
import { useReportDetail } from '@/src/hooks/perdidas/useReportDetail';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import BackButton from '@/src/components/BackButton';
import { MapPin, Phone, Clock, AlertTriangle, Wifi, Navigation, Share2, CheckCircle2, Info, Scale, Fingerprint, Calendar, PawPrint, Eye, Pencil, Send } from 'lucide-react-native';
import { shareContent } from '@/src/utils/share';
import { getTimeAgo } from '@/src/utils/formatters';

const { width } = Dimensions.get('window');
// Si la última señal del collar tiene más de este tiempo se considera "sin señal"
const TRACKER_STALE_MS = 15 * 60 * 1000;

export default function PerdidasDetailScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {
        report, isLoading, error, isOwner, isActive, sightings, matches,
        isResolving, isSendingSighting, hasContact,
        refetch, handleResolve, handleCall, submitSighting, goBack, goEdit,
    } = useReportDetail();

    const [showSightingForm, setShowSightingForm] = useState(false);
    const [sightingLocation, setSightingLocation] = useState('');
    const [sightingNote, setSightingNote] = useState('');
    const [shareLocation, setShareLocation] = useState(true);

    if (isLoading) return (
        <ScreenContainer>
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando reporte...</Text>
            </View>
        </ScreenContainer>
    );

    if (error || !report) return (
        <ScreenContainer>
            <View style={styles.center}>
                <AlertTriangle size={48} color={theme.error} />
                <Text style={{ color: theme.text, marginTop: 16, fontWeight: '700' }}>No pudimos cargar el reporte</Text>
                <Text style={{ color: theme.textMuted, marginTop: 6, textAlign: 'center' }}>Puede que ya no exista o que no tengas conexión.</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                    <TouchableOpacity onPress={goBack} accessibilityRole="button" style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
                        <Text style={{ color: theme.text, fontWeight: '700' }}>Regresar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => refetch()} accessibilityRole="button" style={[styles.backBtn, { backgroundColor: theme.primary }]}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScreenContainer>
    );

    const isLost = report.report_type === 'lost';
    const typeColor = isLost ? theme.error : theme.info;
    const hasPoint = report.latitude != null && report.longitude != null;
    const trackerPoint = report.has_tracker && report.current_lat != null && report.current_lng != null;
    const trackerAge = report.last_tracked_at ? Date.now() - new Date(report.last_tracked_at).getTime() : null;
    const trackerLive = trackerAge != null && trackerAge < TRACKER_STALE_MS;

    const markers: MapMarker[] = [];
    if (hasPoint) {
        markers.push({
            id: report.id,
            latitude: report.latitude as number,
            longitude: report.longitude as number,
            title: report.pet_name,
            description: isLost ? 'Última ubicación conocida' : 'Lugar donde se encontró',
            color: typeColor,
        });
    }
    if (trackerPoint) {
        markers.push({
            id: `${report.id}-tracker`,
            latitude: report.current_lat as number,
            longitude: report.current_lng as number,
            title: 'Michi-Tracker',
            description: 'Posición actual del collar',
            color: theme.success,
        });
    }
    if (isOwner) {
        sightings.filter(s => s.latitude != null && s.longitude != null).forEach((s) => {
            markers.push({
                id: `sighting-${s.id}`,
                latitude: s.latitude as number,
                longitude: s.longitude as number,
                title: 'Avistamiento',
                description: s.note || s.location_text || '',
                color: theme.warning,
            });
        });
    }
    const mapCenter = trackerPoint
        ? { lat: report.current_lat as number, lng: report.current_lng as number }
        : hasPoint ? { lat: report.latitude as number, lng: report.longitude as number } : null;

    const onSendSighting = async () => {
        const ok = await submitSighting(sightingLocation, sightingNote, shareLocation);
        if (ok) {
            setSightingLocation('');
            setSightingNote('');
            setShowSightingForm(false);
        }
    };

    const infoItems = [
        { icon: Fingerprint, label: 'Raza', value: report.breed },
        { icon: Info, label: 'Color', value: report.color },
        { icon: Scale, label: 'Tamaño', value: report.size },
        { icon: Calendar, label: 'Edad aprox.', value: report.age_approx },
    ];

    return (
        <ScreenContainer noPadding>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.hero}>
                    {report.image_url ? (
                        <Image source={{ uri: report.image_url }} style={styles.heroImage} accessibilityLabel={`Foto de ${report.pet_name}`} />
                    ) : (
                        <View style={[styles.heroImage, { backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' }]}>
                            <PawPrint size={72} color={theme.textMuted} />
                            <Text style={{ color: theme.textMuted, marginTop: 8, fontWeight: '600' }}>Sin foto</Text>
                        </View>
                    )}
                    <View style={[styles.heroOverlay, { backgroundColor: 'rgba(15, 23, 42, 0.45)' }]} />

                    <BackButton onPress={goBack} color="#fff" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }} />

                    <View style={styles.heroContent}>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, { backgroundColor: typeColor }]}>
                                <Text style={styles.statusText}>{isLost ? 'PERDIDO' : 'ENCONTRADO'}</Text>
                            </View>
                            {report.is_resolved && (
                                <View style={[styles.statusBadge, { backgroundColor: theme.success }]}>
                                    <CheckCircle2 size={12} color="#fff" />
                                    <Text style={styles.statusText}>REUNIDO</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.petName} numberOfLines={2}>{report.pet_name}</Text>
                        {!!report.last_seen_location && (
                            <View style={styles.lastSeenRow}>
                                <MapPin size={16} color="#cbd5e1" />
                                <Text style={styles.lastSeenText}>{report.last_seen_location}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.body}>
                    {isActive && isLost && (
                        <View style={[styles.alertCard, { backgroundColor: theme.errorLight, borderColor: theme.error }]}>
                            <AlertTriangle size={20} color={theme.error} />
                            <Text style={[styles.alertText, { color: theme.error }]}>
                                Búsqueda activa. Cualquier información es vital.
                            </Text>
                        </View>
                    )}

                    <View style={styles.grid}>
                        {infoItems.map(({ icon: Icon, label, value }) => (
                            <View key={label} style={[styles.gridItem, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                                <Icon size={18} color={theme.primary} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.gridLabel, { color: theme.textMuted }]}>{label}</Text>
                                    <Text style={[styles.gridValue, { color: theme.text }]} numberOfLines={1}>{value || 'No especificado'}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {report.has_tracker && (
                        <View style={[styles.trackerCard, { backgroundColor: theme.successLight, borderColor: theme.success }]}>
                            <View style={styles.trackerHeader}>
                                <View style={styles.trackerTitleRow}>
                                    <Wifi size={24} color={theme.success} />
                                    <Text style={[styles.trackerTitle, { color: theme.success }]}>Michi-Tracker</Text>
                                </View>
                                <View style={[styles.liveBadge, { backgroundColor: trackerLive ? theme.success : theme.surface, borderColor: trackerLive ? theme.success : theme.border }]}>
                                    <Text style={[styles.liveText, { color: trackerLive ? '#fff' : theme.textMuted }]}>
                                        {trackerLive ? 'CONECTADO' : 'SIN SEÑAL'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.trackerMetrics}>
                                <View style={styles.metric}>
                                    <Clock size={20} color={theme.textMuted} />
                                    <View>
                                        <Text style={[styles.metricLabel, { color: theme.textMuted }]}>ÚLTIMA SEÑAL</Text>
                                        <Text style={[styles.metricValue, { color: theme.text }]}>
                                            {report.last_tracked_at ? getTimeAgo(report.last_tracked_at) : 'Aún sin datos'}
                                        </Text>
                                    </View>
                                </View>
                                {trackerPoint && (
                                    <View style={styles.metric}>
                                        <Navigation size={20} color={theme.textMuted} />
                                        <View>
                                            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>POSICIÓN</Text>
                                            <Text style={[styles.metricValue, { color: theme.text }]}>
                                                {(report.current_lat as number).toFixed(4)}, {(report.current_lng as number).toFixed(4)}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Descripción y señas</Text>
                    <Text style={[styles.descriptionText, { color: theme.textMuted }]}>
                        {report.description?.trim() || 'El reporte no incluye descripción adicional.'}
                    </Text>

                    {mapCenter && (
                        <>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                {trackerPoint ? 'Ubicación en el mapa' : isLost ? 'Última ubicación conocida' : 'Lugar donde se encontró'}
                            </Text>
                            <View style={[styles.mapWrapper, { borderColor: theme.border }]}>
                                <WebMapView
                                    style={styles.map}
                                    initialLatitude={mapCenter.lat}
                                    initialLongitude={mapCenter.lng}
                                    initialZoom={16}
                                    markers={markers}
                                />
                            </View>
                        </>
                    )}

                    {isOwner && isActive && matches.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Posibles coincidencias cerca</Text>
                            {matches.map((m) => (
                                <TouchableOpacity
                                    key={m.id}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Ver reporte de ${m.pet_name}`}
                                    onPress={() => router.push(`/perdidas/${m.id}` as any)}
                                    style={[styles.rowCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                                >
                                    <PawPrint size={18} color={theme.primary} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.gridValue, { color: theme.text }]} numberOfLines={1}>{m.pet_name}</Text>
                                        <Text style={{ color: theme.textMuted, fontSize: 12 }} numberOfLines={1}>{m.last_seen_location || 'Sin ubicación'}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            <View style={{ height: 16 }} />
                        </>
                    )}

                    {isOwner && (
                        <>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Avistamientos ({sightings.length})</Text>
                            {sightings.length === 0 ? (
                                <Text style={[styles.descriptionText, { color: theme.textMuted, marginBottom: 24 }]}>
                                    Aún nadie ha avisado que lo vio. Cuando alguien lo haga, recibirás una notificación y aparecerá aquí.
                                </Text>
                            ) : sightings.map((s) => (
                                <View key={s.id} style={[styles.rowCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder, alignItems: 'flex-start' }]}>
                                    <Eye size={18} color={theme.warning} style={{ marginTop: 2 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.gridValue, { color: theme.text }]}>{s.location_text || (s.latitude != null ? 'Ubicación marcada en el mapa' : 'Sin ubicación')}</Text>
                                        {!!s.note && <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>{s.note}</Text>}
                                        <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 4 }}>{getTimeAgo(s.created_at)}</Text>
                                    </View>
                                </View>
                            ))}
                        </>
                    )}

                    {!isOwner && isActive && (
                        <View style={[styles.sightingCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Eye size={20} color={theme.primary} />
                                <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0, flex: 1 }]}>
                                    {isLost ? '¿Lo viste?' : '¿Es tu mascota?'}
                                </Text>
                            </View>
                            {!showSightingForm ? (
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    onPress={() => setShowSightingForm(true)}
                                    style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 14 }]}
                                >
                                    <Text style={styles.primaryBtnText}>Avisar al dueño</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={{ marginTop: 14, gap: 10 }}>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                                        placeholder="¿Dónde lo viste? (calle, colonia, referencia)"
                                        placeholderTextColor={theme.textMuted}
                                        value={sightingLocation}
                                        onChangeText={setSightingLocation}
                                        accessibilityLabel="Lugar del avistamiento"
                                    />
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text, height: 90, textAlignVertical: 'top' }]}
                                        placeholder="Nota para el dueño (cómo estaba, hacia dónde fue...)"
                                        placeholderTextColor={theme.textMuted}
                                        value={sightingNote}
                                        onChangeText={setSightingNote}
                                        multiline
                                        accessibilityLabel="Nota del avistamiento"
                                    />
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <Text style={{ flex: 1, color: theme.textMuted, fontSize: 13 }}>Compartir mi ubicación actual como punto del avistamiento</Text>
                                        <Switch value={shareLocation} onValueChange={setShareLocation} trackColor={{ true: theme.primary, false: theme.border }} />
                                    </View>
                                    <TouchableOpacity
                                        accessibilityRole="button"
                                        onPress={onSendSighting}
                                        disabled={isSendingSighting}
                                        style={[styles.primaryBtn, { backgroundColor: theme.primary, opacity: isSendingSighting ? 0.6 : 1 }]}
                                    >
                                        {isSendingSighting ? <ActivityIndicator color="#fff" /> : (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Send size={18} color="#fff" />
                                                <Text style={styles.primaryBtnText}>Enviar avistamiento</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setShowSightingForm(false)} accessibilityRole="button" style={{ alignItems: 'center', padding: 6 }}>
                                        <Text style={{ color: theme.textMuted, fontWeight: '600' }}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}

                    {isOwner && isActive && (
                        <TouchableOpacity
                            style={[styles.resolveBtn, { backgroundColor: theme.success, opacity: isResolving ? 0.6 : 1 }]}
                            onPress={handleResolve}
                            disabled={isResolving}
                            accessibilityRole="button"
                        >
                            <CheckCircle2 size={24} color="#fff" />
                            <Text style={styles.resolveBtnText}>{isLost ? 'Marcar como reunido' : 'Marcar como devuelto'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={{ height: 140 }} />
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
                <View style={styles.footerActions}>
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Compartir reporte"
                        style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => shareContent(isLost ? 'Mascota perdida' : 'Mascota encontrada', `${isLost ? 'Se perdió' : 'Se encontró'} ${report.pet_name || 'una mascota'}. Ayúdanos a difundir en Michicondrias 🐾`)}
                    >
                        <Share2 size={24} color={theme.text} />
                    </TouchableOpacity>
                    {isOwner ? (
                        isActive ? (
                            <TouchableOpacity
                                accessibilityRole="button"
                                style={[styles.callBtn, { backgroundColor: theme.primary }]}
                                onPress={goEdit}
                            >
                                <Pencil size={20} color="#fff" />
                                <Text style={styles.callText}>Editar reporte</Text>
                            </TouchableOpacity>
                        ) : null
                    ) : (
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel={hasContact ? 'Contactar al dueño del reporte' : 'Este reporte no tiene datos de contacto'}
                            style={[styles.callBtn, { backgroundColor: typeColor, opacity: hasContact ? 1 : 0.5 }]}
                            onPress={handleCall}
                        >
                            <Phone size={20} color="#fff" />
                            <Text style={styles.callText}>{hasContact ? 'Contactar' : 'Sin contacto'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
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
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    liveText: {
        fontSize: 9,
        fontWeight: '900',
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
    resolveBtn: {
        height: 64,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
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
    rowCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 10,
    },
    sightingCard: {
        padding: 18,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
    },
    primaryBtn: {
        height: 50,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    backBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
});
