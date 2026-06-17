/**
 * Historial Grooming [petId] — Pet grooming history timeline
 * Before/after photos, grooming file info, session notes
 */
import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Scissors, Calendar, Clock, FileText, Droplets, Heart, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useGroomingClient } from '@/src/hooks/grooming/useGroomingClient';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import type { GroomingAppointment } from '@/src/services/grooming';

export default function HistorialGroomingScreen() {
    const { petId } = useLocalSearchParams<{ petId: string }>();
    const { theme } = useTheme();
    const {
        groomingHistory,
        historyLoading,
        historyRefetching,
        refetchHistory,
    } = useGroomingClient(petId);

    const file = groomingHistory?.file;
    const appointments = groomingHistory?.appointments ?? [];

    const renderFileCard = () => {
        if (!file) return null;
        return (
            <View style={[styles.fileCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <View style={styles.fileHeader}>
                    <View style={[styles.fileIcon, { backgroundColor: theme.primaryLight }]}>
                        <FileText size={22} color={theme.primary} />
                    </View>
                    <Text style={[styles.fileTitle, { color: theme.text }]}>Expediente de Grooming</Text>
                </View>

                {file.hair_type ? (
                    <View style={styles.fileRow}>
                        <Scissors size={14} color={theme.textMuted} />
                        <Text style={[styles.fileLabel, { color: theme.textMuted }]}>Tipo de pelo:</Text>
                        <Text style={[styles.fileValue, { color: theme.text }]}>{file.hair_type}</Text>
                    </View>
                ) : null}
                {file.preferred_shampoo ? (
                    <View style={styles.fileRow}>
                        <Droplets size={14} color={theme.textMuted} />
                        <Text style={[styles.fileLabel, { color: theme.textMuted }]}>Shampoo preferido:</Text>
                        <Text style={[styles.fileValue, { color: theme.text }]}>{file.preferred_shampoo}</Text>
                    </View>
                ) : null}
                {file.behavior_notes ? (
                    <View style={styles.fileRow}>
                        <Heart size={14} color={theme.textMuted} />
                        <Text style={[styles.fileLabel, { color: theme.textMuted }]}>Comportamiento:</Text>
                        <Text style={[styles.fileValue, { color: theme.text }]}>{file.behavior_notes}</Text>
                    </View>
                ) : null}
                {file.allergies_detected ? (
                    <View style={[styles.allergyBadge, { backgroundColor: theme.warningLight }]}>
                        <AlertTriangle size={14} color={theme.warning} />
                        <Text style={[styles.allergyText, { color: theme.warning }]}>
                            Alergias: {file.allergies_detected}
                        </Text>
                    </View>
                ) : null}
                {file.last_service_date ? (
                    <Text style={[styles.lastVisit, { color: theme.textMuted }]}>
                        Última visita: {file.last_service_date}
                    </Text>
                ) : null}
            </View>
        );
    };

    const renderTimelineItem = ({ item, index }: { item: GroomingAppointment; index: number }) => {
        const isLast = index === appointments.length - 1;
        const hasPhotos = !!item.before_photo_url || !!item.after_photo_url;

        return (
            <View style={styles.timelineRow}>
                {/* Timeline rail */}
                <View style={styles.timelineRail}>
                    <View style={[styles.timelineDot, { backgroundColor: theme.primary }]} />
                    {!isLast && <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />}
                </View>

                {/* Content card */}
                <View style={[styles.sessionCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                    {/* Header */}
                    <View style={styles.sessionHeader}>
                        <Text style={[styles.sessionService, { color: theme.text }]}>
                            {item.service_type || 'Sesión de Grooming'}
                        </Text>
                        <View style={styles.sessionDateRow}>
                            <Calendar size={12} color={theme.textMuted} />
                            <Text style={[styles.sessionDate, { color: theme.textMuted }]}>{item.date}</Text>
                            <Clock size={12} color={theme.textMuted} />
                            <Text style={[styles.sessionDate, { color: theme.textMuted }]}>{item.time}</Text>
                        </View>
                    </View>

                    {/* Before / After photos */}
                    {hasPhotos && (
                        <View style={styles.photosContainer}>
                            {item.before_photo_url ? (
                                <View style={styles.photoColumn}>
                                    <Image source={{ uri: item.before_photo_url }} style={styles.photo} />
                                    <Text style={[styles.photoCaption, { color: theme.textMuted }]}>Antes</Text>
                                </View>
                            ) : null}
                            {item.after_photo_url ? (
                                <View style={styles.photoColumn}>
                                    <Image source={{ uri: item.after_photo_url }} style={styles.photo} />
                                    <Text style={[styles.photoCaption, { color: theme.textMuted }]}>Después</Text>
                                </View>
                            ) : null}
                        </View>
                    )}

                    {/* Skin report */}
                    {item.skin_report ? (
                        <View style={[styles.reportBox, { backgroundColor: theme.backgroundSecondary }]}>
                            <FileText size={14} color={theme.primary} />
                            <Text style={[styles.reportText, { color: theme.text }]}>
                                {item.skin_report}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>
        );
    };

    const listHeader = (
        <>
            {renderFileCard()}
            {appointments.length > 0 && (
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    📅 Sesiones ({appointments.length})
                </Text>
            )}
        </>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Historial"
                subtitle="Grooming & Cuidado de Piel"
                gradient={[theme.primary, theme.secondary]}
            />

            <DataList
                data={appointments}
                renderItem={renderTimelineItem}
                keyExtractor={(item) => item.id}
                isLoading={historyLoading}
                loadingMessage="Cargando historial..."
                onRefresh={refetchHistory}
                isRefreshing={historyRefetching}
                header={listHeader}
                emptyIcon={<Scissors size={32} color={theme.textMuted} />}
                emptyTitle="Sin historial de grooming"
                emptySubtitle="Aún no hay sesiones registradas para esta mascota."
                contentStyle={styles.list}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },

    // Grooming file card
    fileCard: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        marginTop: 16,
        marginBottom: 24,
    },
    fileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    fileIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileTitle: {
        fontSize: 18,
        fontWeight: '900',
    },
    fileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    fileLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    fileValue: {
        fontSize: 13,
        fontWeight: '700',
        flex: 1,
    },
    allergyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        gap: 8,
        marginTop: 6,
    },
    allergyText: {
        fontSize: 13,
        fontWeight: '700',
        flex: 1,
    },
    lastVisit: {
        fontSize: 12,
        marginTop: 10,
        textAlign: 'right',
    },

    // Section title
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 16,
    },

    // Timeline
    timelineRow: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    timelineRail: {
        width: 28,
        alignItems: 'center',
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 20,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        marginTop: 4,
    },

    // Session card
    sessionCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
        marginLeft: 8,
    },
    sessionHeader: {
        marginBottom: 12,
    },
    sessionService: {
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 4,
    },
    sessionDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    sessionDate: {
        fontSize: 12,
        fontWeight: '500',
    },

    // Photos
    photosContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    photoColumn: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    photo: {
        width: '100%',
        height: 100,
        borderRadius: 12,
    },
    photoCaption: {
        fontSize: 11,
        fontWeight: '600',
    },

    // Report
    reportBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    reportText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 19,
    },
});
