/**
 * Gestión Grooming — Provider appointment management
 * Appointment list, filter by status, photo upload (before/after), status management
 */
import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    TextInput,
    Modal,
    ActivityIndicator,
} from 'react-native';
import {
    Scissors,
    Camera,
    Calendar,
    Clock,
    CheckCircle,
    Play,
    FileText,
    X,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/src/hooks/useTheme';
import { useGroomingProvider } from '@/src/hooks/grooming/useGroomingProvider';
import type { ProviderFilter } from '@/src/hooks/grooming/useGroomingProvider';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import type { GroomingAppointment } from '@/src/services/grooming';

const FILTERS: { key: ProviderFilter; label: string; icon: string }[] = [
    { key: 'all',         label: 'Todas',       icon: '📋' },
    { key: 'scheduled',   label: 'Agendadas',   icon: '📅' },
    { key: 'in_progress', label: 'En Progreso', icon: '✂️' },
    { key: 'completed',   label: 'Completadas', icon: '✅' },
];

const STATUS_ACTIONS: Record<string, { next: string; label: string }> = {
    scheduled:   { next: 'in_progress', label: 'Iniciar Sesión' },
    in_progress: { next: 'completed',   label: 'Marcar Completada' },
};

export default function GestionGroomingScreen() {
    const { theme } = useTheme();
    const {
        appointments,
        filter,
        isLoading,
        isRefetching,
        isUpdating,
        setFilter,
        refetch,
        updatePhotos,
        updateStatus,
    } = useGroomingProvider();

    // ── Photo modal state ────────────────────────────────────────
    const [photoModal, setPhotoModal] = useState<GroomingAppointment | null>(null);
    const [beforePhoto, setBeforePhoto] = useState('');
    const [afterPhoto, setAfterPhoto] = useState('');
    const [skinReport, setSkinReport] = useState('');

    const openPhotoModal = (appointment: GroomingAppointment) => {
        setPhotoModal(appointment);
        setBeforePhoto(appointment.before_photo_url || '');
        setAfterPhoto(appointment.after_photo_url || '');
        setSkinReport(appointment.skin_report || '');
    };

    const closePhotoModal = () => {
        setPhotoModal(null);
        setBeforePhoto('');
        setAfterPhoto('');
        setSkinReport('');
    };

    const pickPhoto = async (type: 'before' | 'after') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            if (type === 'before') setBeforePhoto(result.assets[0].uri);
            else setAfterPhoto(result.assets[0].uri);
        }
    };

    const handleSavePhotos = () => {
        if (!photoModal) return;
        updatePhotos(photoModal.id, {
            before_photo_url: beforePhoto || undefined,
            after_photo_url: afterPhoto || undefined,
            skin_report: skinReport || undefined,
        });
        closePhotoModal();
    };

    const renderFilterChip = (f: typeof FILTERS[number]) => {
        const isActive = filter === f.key;
        return (
            <TouchableOpacity
                key={f.key}
                style={[
                    styles.filterChip,
                    {
                        backgroundColor: isActive ? theme.primary : theme.surface,
                        borderColor: isActive ? theme.primary : theme.cardBorder,
                    },
                ]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.7}
            >
                <Text style={styles.filterEmoji}>{f.icon}</Text>
                <Text style={[styles.filterLabel, { color: isActive ? '#fff' : theme.textMuted }]}>
                    {f.label}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderAppointment = ({ item }: { item: GroomingAppointment }) => {
        const statusAction = STATUS_ACTIONS[item.status || ''];
        const hasPhotos = !!item.before_photo_url || !!item.after_photo_url;

        return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={[styles.cardIcon, { backgroundColor: theme.primaryLight }]}>
                        <Scissors size={22} color={theme.primary} />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={[styles.cardService, { color: theme.text }]}>
                            {item.service_type || 'Grooming'}
                        </Text>
                        <View style={styles.cardDateRow}>
                            <Calendar size={12} color={theme.textMuted} />
                            <Text style={[styles.cardMeta, { color: theme.textMuted }]}>{item.date}</Text>
                            <Clock size={12} color={theme.textMuted} />
                            <Text style={[styles.cardMeta, { color: theme.textMuted }]}>{item.time}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: getStatusColor(item.status, theme).bg }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status, theme).color }]}>
                            {getStatusLabel(item.status)}
                        </Text>
                    </View>
                </View>

                {/* Photos preview */}
                {hasPhotos && (
                    <View style={styles.photosRow}>
                        {item.before_photo_url ? (
                            <View style={styles.photoThumb}>
                                <Image source={{ uri: item.before_photo_url }} style={styles.thumbImg} />
                                <Text style={[styles.photoLabel, { color: theme.textMuted }]}>Antes</Text>
                            </View>
                        ) : null}
                        {item.after_photo_url ? (
                            <View style={styles.photoThumb}>
                                <Image source={{ uri: item.after_photo_url }} style={styles.thumbImg} />
                                <Text style={[styles.photoLabel, { color: theme.textMuted }]}>Después</Text>
                            </View>
                        ) : null}
                    </View>
                )}

                {/* Actions */}
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.primaryLight }]}
                        onPress={() => openPhotoModal(item)}
                    >
                        <Camera size={16} color={theme.primary} />
                        <Text style={[styles.actionLabel, { color: theme.primary }]}>Fotos & Reporte</Text>
                    </TouchableOpacity>

                    {statusAction && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: theme.successLight }]}
                            onPress={() => updateStatus(item.id, statusAction.next)}
                            disabled={isUpdating}
                        >
                            {statusAction.next === 'in_progress' ? (
                                <Play size={16} color={theme.success} />
                            ) : (
                                <CheckCircle size={16} color={theme.success} />
                            )}
                            <Text style={[styles.actionLabel, { color: theme.success }]}>
                                {statusAction.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const listHeader = (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
            style={styles.filtersScroll}
        >
            {FILTERS.map(renderFilterChip)}
        </ScrollView>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Gestión de Citas"
                subtitle="Panel del estilista"
                gradient={[theme.primary, theme.secondary]}
            />

            <DataList
                data={appointments}
                renderItem={renderAppointment}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                loadingMessage="Cargando citas..."
                onRefresh={refetch}
                isRefreshing={isRefetching}
                header={listHeader}
                emptyIcon={<Scissors size={32} color={theme.textMuted} />}
                emptyTitle="Sin citas"
                emptySubtitle="No tienes citas asignadas con este filtro."
                contentStyle={styles.list}
            />

            {/* ── Photo / Report Modal ───────────────────────── */}
            <Modal visible={!!photoModal} animationType="slide" transparent>
                <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>📸 Fotos & Reporte</Text>
                            <TouchableOpacity onPress={closePhotoModal}>
                                <X size={24} color={theme.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Before photo */}
                            <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Foto Antes</Text>
                            <TouchableOpacity
                                style={[styles.photoPicker, { borderColor: theme.cardBorder, backgroundColor: theme.surface }]}
                                onPress={() => pickPhoto('before')}
                            >
                                {beforePhoto ? (
                                    <Image source={{ uri: beforePhoto }} style={styles.photoPreview} />
                                ) : (
                                    <View style={styles.photoPlaceholder}>
                                        <Camera size={28} color={theme.textMuted} />
                                        <Text style={[styles.photoPlaceholderText, { color: theme.textMuted }]}>
                                            Agregar foto antes
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            {/* After photo */}
                            <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Foto Después</Text>
                            <TouchableOpacity
                                style={[styles.photoPicker, { borderColor: theme.cardBorder, backgroundColor: theme.surface }]}
                                onPress={() => pickPhoto('after')}
                            >
                                {afterPhoto ? (
                                    <Image source={{ uri: afterPhoto }} style={styles.photoPreview} />
                                ) : (
                                    <View style={styles.photoPlaceholder}>
                                        <Camera size={28} color={theme.textMuted} />
                                        <Text style={[styles.photoPlaceholderText, { color: theme.textMuted }]}>
                                            Agregar foto después
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            {/* Skin report */}
                            <Text style={[styles.modalLabel, { color: theme.textMuted }]}>
                                <FileText size={14} color={theme.textMuted} /> Reporte de Piel
                            </Text>
                            <TextInput
                                style={[
                                    styles.textArea,
                                    {
                                        backgroundColor: theme.inputBg,
                                        borderColor: theme.inputBorder,
                                        color: theme.text,
                                    },
                                ]}
                                value={skinReport}
                                onChangeText={setSkinReport}
                                placeholder="Observaciones sobre la piel, pelaje, parásitos..."
                                placeholderTextColor={theme.textMuted}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />

                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                                onPress={handleSavePhotos}
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Guardar</Text>
                                )}
                            </TouchableOpacity>

                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

// ── Helpers ──────────────────────────────────────────────────────
function getStatusLabel(status?: string): string {
    switch (status) {
        case 'scheduled':   return 'Agendada';
        case 'confirmed':   return 'Confirmada';
        case 'in_progress': return 'En Progreso';
        case 'completed':   return 'Completada';
        case 'cancelled':   return 'Cancelada';
        default:            return 'Pendiente';
    }
}

function getStatusColor(status: string | undefined, theme: any): { color: string; bg: string } {
    switch (status) {
        case 'scheduled':   return { color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' };
        case 'confirmed':   return { color: theme.success, bg: theme.successLight };
        case 'in_progress': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
        case 'completed':   return { color: '#6366f1', bg: 'rgba(99,102,241,0.12)' };
        case 'cancelled':   return { color: theme.error, bg: theme.errorLight };
        default:            return { color: theme.textMuted, bg: theme.backgroundSecondary };
    }
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },

    // Filters
    filtersScroll: {
        marginBottom: 16,
    },
    filtersRow: {
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 6,
    },
    filterEmoji: {
        fontSize: 14,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '700',
    },

    // Card
    card: {
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 14,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    cardService: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 3,
    },
    cardDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    cardMeta: {
        fontSize: 12,
        fontWeight: '500',
    },
    statusPill: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },

    // Photos
    photosRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 14,
    },
    photoThumb: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    thumbImg: {
        width: '100%',
        height: 80,
        borderRadius: 12,
    },
    photoLabel: {
        fontSize: 11,
        fontWeight: '600',
    },

    // Actions
    cardActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    actionLabel: {
        fontSize: 13,
        fontWeight: '700',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
        marginTop: 12,
    },
    photoPicker: {
        borderRadius: 16,
        borderWidth: 1.5,
        overflow: 'hidden',
        marginBottom: 8,
    },
    photoPreview: {
        width: '100%',
        height: 160,
    },
    photoPlaceholder: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    photoPlaceholderText: {
        fontSize: 14,
        fontWeight: '600',
    },
    textArea: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 16,
        fontSize: 14,
        minHeight: 100,
    },
    saveBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 14,
        marginTop: 20,
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
    },
});
