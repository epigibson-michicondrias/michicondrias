import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Modal, TextInput } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import Button from '@/src/components/Button';
import { useVideoConsultations } from '@/src/hooks/clinica/useVideoConsultations';
import { ConsultationItem } from '@/src/services/directorio';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Plus, Video, Calendar, Clock, VideoOff, ExternalLink, X } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import DatePicker from '@/src/components/DatePicker';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { families, font, layout, spacing, shadow } from '@/constants/design';

export default function ConsultasVideoScreen() {
    const { theme } = useTheme();
    const {
        modalVisible, setModalVisible, loadingAction,
        selectedPetId, setSelectedPetId, selectedClinicId, setSelectedClinicId,
        selectedVetId, setSelectedVetId, scheduledAt, setScheduledAt,
        notes, setNotes, isVet, isLoading, consultations,
        pets, clinics, vets, handleBook, handleStatusUpdate,
        launchVideoRoom, openBookingModal,
    } = useVideoConsultations();

    const STATUS_LABELS: Record<string, string> = { scheduled: 'Programada', active: 'En curso', completed: 'Finalizada', cancelled: 'Cancelada' };
    const getStatusColor = (status: string) => {
        switch ((status || '').toLowerCase()) {
            case 'scheduled': return theme.info;
            case 'active': return theme.success;
            case 'completed': return theme.primary;
            case 'cancelled': return theme.error;
            default: return theme.textMuted;
        }
    };

    const renderConsultationItem = ({ item }: { item: ConsultationItem }) => {
        const statusColor = getStatusColor(item.status);
        const dateObj = new Date(item.scheduled_at);
        const formattedDate = dateObj.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const formattedTime = dateObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

        return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.roomBadgeContainer}>
                        <Video size={18} color={theme.primary} />
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Tele-Consulta</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {(STATUS_LABELS[item.status] || item.status).toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.timeRow}>
                        <Calendar size={16} color={theme.textMuted} />
                        <Text style={[styles.timeText, { color: theme.text }]}>{formattedDate}</Text>
                    </View>
                    <View style={styles.timeRow}>
                        <Clock size={16} color={theme.textMuted} />
                        <Text style={[styles.timeText, { color: theme.text }]}>{formattedTime}</Text>
                    </View>
                    {item.notes && (
                        <View style={styles.notesBox}>
                            <Text style={[styles.notesLabel, { color: theme.textMuted }]}>SÍNTOMAS / NOTAS:</Text>
                            <Text style={[styles.notesText, { color: theme.text }]}>{item.notes}</Text>
                        </View>
                    )}
                </View>

                <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                    {(item.status === 'scheduled' || item.status === 'active') && !(isVet && item.status === 'active') && (
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Cancelar videoconsulta"
                            style={[styles.btnSecondary, { borderColor: theme.error, borderWidth: 1 }]}
                            onPress={() => handleStatusUpdate(item.id, 'cancelled')}
                        >
                            <Text style={{ color: theme.error, fontFamily: families.extrabold, fontSize: font.base }}>Cancelar</Text>
                        </TouchableOpacity>
                    )}

                    {isVet && item.status === 'scheduled' && (
                        <TouchableOpacity
                            style={[styles.btnSecondary, { borderColor: theme.success, borderWidth: 1 }]}
                            onPress={() => handleStatusUpdate(item.id, 'active')}
                        >
                            <Text style={{ color: theme.success, fontFamily: families.extrabold, fontSize: font.base }}>Iniciar Sala</Text>
                        </TouchableOpacity>
                    )}

                    {isVet && item.status === 'active' && (
                        <TouchableOpacity
                            style={[styles.btnSecondary, { borderColor: theme.primary, borderWidth: 1 }]}
                            onPress={() => handleStatusUpdate(item.id, 'completed')}
                        >
                            <Text style={{ color: theme.primary, fontFamily: families.extrabold, fontSize: font.base }}>Finalizar Consulta</Text>
                        </TouchableOpacity>
                    )}

                    {item.status === 'active' && item.room_url ? (
                        <TouchableOpacity
                            style={[styles.btnPrimary, { backgroundColor: theme.success }]}
                            onPress={() => launchVideoRoom(item.room_url)}
                        >
                            <ExternalLink size={16} color={theme.onPrimary} />
                            <Text style={[styles.btnText, { color: theme.onPrimary }, { color: theme.onPrimary }]}>Unirse al Video</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.disabledRoom}>
                            <VideoOff size={16} color={theme.textMuted} />
                            <Text style={[styles.disabledRoomText, { color: theme.textMuted }]}>Sala no iniciada</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Videoconsultas"
                actions={!isVet ? [{ icon: Plus, label: 'Agendar videoconsulta', onPress: openBookingModal }] : undefined}
            />

            <View style={styles.content}>
                {isLoading ? (
                    <LoadingOverlay message="Cargando videoconsultas..." />
                ) : (
                    <FlatList
            refreshControl={<AppRefreshControl />}
                        data={consultations}
                        renderItem={renderConsultationItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={
                            <EmptyState
                                icon={<VideoOff size={64} color={theme.textMuted} strokeWidth={1} />}
                                title={isVet ? "No tienes videoconsultas asignadas" : "No tienes videoconsultas programadas"}
                                subtitle={isVet ? undefined : "Agenda una con el botón +"}
                            />
                        }
                    />
                )}
            </View>

            {/* Modal para agendar consulta */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)} accessibilityRole="button" accessibilityLabel="Cerrar">
                            <X size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Agendar Consulta</Text>
                        <Button label="Agendar Videoconsulta" onPress={handleBook} loading={loadingAction} style={{ minWidth: 140 }} />
                    </View>

                    <KeyboardScreen style={{ padding: spacing.xxl }}>
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Mascota *</Text>
                            <View style={[styles.pickerContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Picker
                                    selectedValue={selectedPetId}
                                    onValueChange={(val) => setSelectedPetId(val)}
                                    style={{ color: theme.text }}
                                >
                                    <Picker.Item label="Elige una mascota" value="" />
                                    {pets.map((pet) => (
                                        <Picker.Item key={pet.id} label={pet.name} value={pet.id} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Clínica</Text>
                            <View style={[styles.pickerContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Picker
                                    selectedValue={selectedClinicId}
                                    onValueChange={(val) => setSelectedClinicId(val)}
                                    style={{ color: theme.text }}
                                >
                                    <Picker.Item label="Elige una clínica (opcional)" value="" />
                                    {clinics.map((c) => (
                                        <Picker.Item key={c.id} label={c.name} value={c.id} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Médico Veterinario</Text>
                            <View style={[styles.pickerContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Picker
                                    selectedValue={selectedVetId}
                                    onValueChange={(val) => setSelectedVetId(val)}
                                    style={{ color: theme.text }}
                                    enabled={!!selectedClinicId}
                                >
                                    <Picker.Item label="Elige un médico (opcional)" value="" />
                                    {vets.map((v) => (
                                        <Picker.Item key={v.id} label={`${v.first_name} ${v.last_name || ''}`} value={v.id} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <DatePicker
                                label="Fecha *"
                                value={scheduledAt}
                                minimumDate={new Date()}
                                onChange={(d) => { const n = new Date(scheduledAt); n.setFullYear(d.getFullYear(), d.getMonth(), d.getDate()); setScheduledAt(n); }}
                            />
                        </View>
                        <View style={styles.formGroup}>
                            <DatePicker
                                label="Hora *"
                                mode="time"
                                value={scheduledAt}
                                onChange={(d) => { const n = new Date(scheduledAt); n.setHours(d.getHours(), d.getMinutes(), 0, 0); setScheduledAt(n); }}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Detalle de Síntomas o Notas</Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Escribe el motivo de la videoconsulta..."
                                placeholderTextColor={theme.textMuted}
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                        
                        <View style={{ height: 60 }} />
                    </KeyboardScreen>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: { flex: 1 },
    listContainer: { padding: spacing.xxl, gap: spacing.lg, paddingBottom: layout.listClearance },
    card: {
        padding: spacing.lg, borderRadius: 24, borderWidth: 1, gap: spacing.md,
        ...shadow.card,
        shadowOpacity: 0.05, shadowRadius: 5,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    roomBadgeContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    cardTitle: { fontSize: font.lg, fontFamily: families.extrabold },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 6 },
    statusText: { fontSize: font.xs, fontFamily: families.extrabold },
    cardBody: { gap: spacing.sm },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    timeText: { fontSize: font.base, fontFamily: families.semibold },
    notesBox: { padding: spacing.md, borderRadius: 12, backgroundColor: 'rgba(128,128,128,0.08)', marginTop: spacing.sm },
    notesLabel: { fontSize: font.xs, fontFamily: families.extrabold, letterSpacing: 0.5, marginBottom: spacing.xs },
    notesText: { fontSize: font.md, fontFamily: families.medium, lineHeight: 16 },
    cardFooter: {
        flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',
        borderTopWidth: 1, paddingTop: spacing.md, gap: spacing.md,
    },
    btnPrimary: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 10 },
    btnSecondary: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    btnText: { fontFamily: families.extrabold, fontSize: font.base },
    disabledRoom: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 10,
        backgroundColor: 'rgba(128,128,128,0.08)',
    },
    disabledRoomText: { fontSize: font.md, fontFamily: families.bold },
    modalContainer: { flex: 1 },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: layout.screenPadding, paddingVertical: spacing.xl,
        borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.2)',
    },
    modalTitle: { fontSize: font.xxl, fontFamily: families.extrabold },
    saveBtnText: { fontSize: font.xl, fontFamily: families.extrabold },
    formGroup: { marginBottom: spacing.xl },
    label: { fontSize: font.md, fontFamily: families.extrabold, marginBottom: spacing.sm, textTransform: 'uppercase' },
    pickerContainer: { height: 54, borderRadius: 16, borderWidth: 1, justifyContent: 'center', overflow: 'hidden' },
    input: { height: 52, borderRadius: 16, paddingHorizontal: spacing.lg, borderWidth: 1, fontSize: font.base, fontFamily: families.semibold },
    textArea: { height: 100, borderRadius: 16, paddingHorizontal: spacing.lg, paddingTop: spacing.md, borderWidth: 1, fontSize: font.base, fontFamily: families.semibold, textAlignVertical: 'top' },
});
