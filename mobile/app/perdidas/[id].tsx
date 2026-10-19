import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
    MapPin, Phone, AlertTriangle, Share2, CheckCircle2, Info, Scale, Fingerprint, Calendar, PawPrint, Eye, Pencil, Clock,
} from 'lucide-react-native';
import WebMapView, { MapMarker } from '@/src/components/WebMapView';
import { useReportDetail } from '@/src/hooks/perdidas/useReportDetail';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import { DetailPhoto, DetailTopBar, DetailFooter, useDetailPhotoHeight } from '@/src/components/layout/DetailLayout';
import IconButton from '@/src/components/IconButton';
import Button from '@/src/components/Button';
import Badge from '@/src/components/Badge';
import ListRow from '@/src/components/ListRow';
import EmptyState from '@/src/components/EmptyState';
import { Skeleton } from '@/src/components/Skeleton';
import { TrackerCard, SightingForm } from '@/src/features/perdidas/ReportDetailSections';
import { shareContent } from '@/src/utils/share';
import { sentenceCase, getTimeAgo } from '@/src/utils/formatters';
import { layout, radius, spacing, tint, type } from '@/constants/design';

// Si la última señal del collar tiene más de este tiempo se considera "sin señal"
const TRACKER_STALE_MS = 15 * 60 * 1000;

export default function PerdidasDetailScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const {
        report, isLoading, error, isOwner, isActive, sightings, matches,
        isResolving, isSendingSighting, hasContact,
        refetch, handleResolve, handleCall, submitSighting, goBack, goEdit,
    } = useReportDetail();
    const photoHeight = useDetailPhotoHeight();

    const isLost = report?.report_type !== 'found';
    const share = () => report && shareContent(
        isLost ? 'Mascota perdida' : 'Mascota encontrada',
        `${isLost ? 'Se perdió' : 'Se encontró'} ${report.pet_name || 'una mascota'}${report.last_seen_location ? ` en ${report.last_seen_location}` : ''}. Ayúdanos a difundir en Michicondrias 🐾`,
    );

    // Botones flotantes fijos sobre la foto (no se van con el scroll)
    const topBar = (
        <DetailTopBar
            onBack={goBack}
            actions={report ? (
                <>
                    {isOwner && isActive ? (
                        <IconButton icon={Pencil} accessibilityLabel="Editar reporte" onPress={goEdit} variant="surface" size="sm" />
                    ) : null}
                    <IconButton icon={Share2} accessibilityLabel="Compartir reporte" onPress={share} variant="surface" size="sm" />
                </>
            ) : undefined}
        />
    );

    if (isLoading) return (
        <ScreenContainer>
            <Skeleton height={photoHeight} borderRadius={0} />
            <View style={styles.content}>
                <Skeleton width="30%" height={20} />
                <Skeleton width="60%" height={28} />
                <Skeleton height={110} />
                <Skeleton height={80} />
            </View>
            {topBar}
        </ScreenContainer>
    );

    if (error || !report) return (
        <ScreenContainer style={styles.center}>
            <EmptyState
                icon={<AlertTriangle size={layout.icon.xl} color={theme.textMuted} />}
                title="No pudimos cargar el reporte"
                subtitle="Puede que ya no exista o que no tengas conexión."
                actionLabel="Reintentar"
                onAction={() => refetch()}
            />
            {topBar}
        </ScreenContainer>
    );

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
        sightings.filter((s) => s.latitude != null && s.longitude != null).forEach((s) => {
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

    const infoItems = [
        { icon: Fingerprint, label: 'Raza', value: report.breed },
        { icon: Info, label: 'Color', value: report.color },
        { icon: Scale, label: 'Tamaño', value: report.size },
        { icon: Calendar, label: 'Edad aprox.', value: report.age_approx },
    ];

    // Una sola acción principal según quién mira
    const footerAction = isOwner
        ? isActive ? (
            <Button
                label={isLost ? 'Ya regresó a casa' : 'Ya volvió con su familia'}
                icon={<CheckCircle2 size={layout.icon.sm} color={theme.onPrimary} />}
                onPress={handleResolve}
                loading={isResolving}
                size="lg"
                style={styles.flex}
            />
        ) : null
        : isActive ? (
            <Button
                label={hasContact ? (isLost ? 'Contactar al dueño' : 'Contactar a quien lo encontró') : 'Sin datos de contacto'}
                icon={<Phone size={layout.icon.sm} color={theme.onPrimary} />}
                onPress={handleCall}
                disabled={!hasContact}
                variant={isLost ? 'danger' : 'primary'}
                size="lg"
                style={styles.flex}
            />
        ) : null;

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <DetailPhoto images={[report.image_url]} fallbackIcon={PawPrint} fallbackLabel="Sin foto" accessibilityLabel={`Foto de ${report.pet_name}`} />

                <View style={styles.content}>
                    <View style={styles.titleBlock}>
                        <View style={styles.badges}>
                            <Badge label={isLost ? 'Perdido' : 'Encontrado'} color={typeColor} variant="solid" />
                            {report.is_resolved ? (
                                <Badge label="Reunido" color={theme.success} variant="solid" icon={<CheckCircle2 size={layout.icon.xs} color={theme.onPrimary} />} />
                            ) : null}
                        </View>
                        <Text style={[type.display, { color: theme.text }]} numberOfLines={2}>{report.pet_name}</Text>
                        {report.last_seen_location ? (
                            <View style={styles.metaRow}>
                                <MapPin size={layout.icon.sm} color={theme.textMuted} />
                                <Text style={[type.body, styles.flex, { color: theme.textMuted }]}>{report.last_seen_location}</Text>
                            </View>
                        ) : null}
                        {report.created_at ? (
                            <View style={styles.metaRow}>
                                <Clock size={layout.icon.sm} color={theme.textMuted} />
                                <Text style={[type.body, { color: theme.textMuted }]}>Reportado {getTimeAgo(report.created_at).toLowerCase()}</Text>
                            </View>
                        ) : null}
                    </View>

                    {isActive && isLost ? (
                        <View style={[styles.alert, { backgroundColor: theme.error + tint.faint, borderColor: theme.error + tint.medium }]}>
                            <AlertTriangle size={layout.icon.sm} color={theme.error} />
                            <Text style={[type.bodyStrong, styles.flex, { color: theme.text }]}>Búsqueda activa: cualquier dato ayuda.</Text>
                        </View>
                    ) : null}

                    <View style={styles.grid}>
                        {infoItems.map(({ icon: Icon, label, value }) => (
                            <View key={label} style={[styles.gridItem, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                                <Icon size={layout.icon.sm} color={theme.primary} />
                                <View style={styles.flex}>
                                    <Text style={[type.caption, { color: theme.textMuted }]}>{label}</Text>
                                    <Text style={[type.bodyStrong, { color: theme.text }]} numberOfLines={1}>{value ? sentenceCase(value) : 'No especificado'}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {report.has_tracker && isOwner ? (
                        <TrackerCard
                            live={trackerLive}
                            lastTrackedAt={report.last_tracked_at}
                            position={trackerPoint ? { lat: report.current_lat as number, lng: report.current_lng as number } : null}
                        />
                    ) : null}

                    <View style={styles.section}>
                        <Text style={[type.title, { color: theme.text }]}>Descripción y señas</Text>
                        <Text style={[type.body, { color: theme.textMuted }]}>
                            {report.description?.trim() || 'El reporte no incluye descripción adicional.'}
                        </Text>
                    </View>

                    {mapCenter ? (
                        <View style={styles.section}>
                            <Text style={[type.title, { color: theme.text }]}>
                                {trackerPoint ? 'Ubicación en el mapa' : isLost ? 'Última ubicación conocida' : 'Lugar donde se encontró'}
                            </Text>
                            <View style={[styles.map, { borderColor: theme.border }]}>
                                <WebMapView
                                    style={styles.flex}
                                    initialLatitude={mapCenter.lat}
                                    initialLongitude={mapCenter.lng}
                                    initialZoom={16}
                                    markers={markers}
                                />
                            </View>
                        </View>
                    ) : null}

                    {isOwner && isActive && matches.length > 0 ? (
                        <View style={styles.section}>
                            <Text style={[type.title, { color: theme.text }]}>Posibles coincidencias cerca</Text>
                            {matches.map((m) => (
                                <ListRow
                                    key={m.id}
                                    icon={PawPrint}
                                    label={m.pet_name}
                                    desc={m.last_seen_location || 'Sin ubicación'}
                                    onPress={() => router.push(`/perdidas/${m.id}`)}
                                />
                            ))}
                        </View>
                    ) : null}

                    {isOwner ? (
                        <View style={styles.section}>
                            <Text style={[type.title, { color: theme.text }]}>Avistamientos ({sightings.length})</Text>
                            {sightings.length === 0 ? (
                                <Text style={[type.body, { color: theme.textMuted }]}>
                                    Aún nadie ha avisado que lo vio. Cuando alguien lo haga, recibirás una notificación y aparecerá aquí.
                                </Text>
                            ) : sightings.map((s) => (
                                <ListRow
                                    key={s.id}
                                    icon={Eye}
                                    color={theme.warning}
                                    label={s.location_text || (s.latitude != null ? 'Ubicación marcada en el mapa' : 'Sin ubicación')}
                                    desc={[s.note, getTimeAgo(s.created_at)].filter(Boolean).join(' · ')}
                                />
                            ))}
                        </View>
                    ) : null}

                    {!isOwner && isActive ? (
                        <SightingForm isLost={isLost} sending={isSendingSighting} onSubmit={submitSighting} />
                    ) : null}
                </View>
            </ScrollView>

            {footerAction ? (
                <DetailFooter>{footerAction}</DetailFooter>
            ) : null}

            {topBar}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    center: { justifyContent: 'center' },
    flex: { flex: 1 },
    scroll: { paddingBottom: spacing.xxl },
    content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.xl, gap: spacing.xl },
    titleBlock: { gap: spacing.xs },
    badges: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    alert: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    gridItem: {
        flexGrow: 1,
        flexBasis: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    section: { gap: spacing.sm },
    map: { height: 200, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1 },
});
